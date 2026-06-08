"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";

import { signInAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

type AuthPortalProps = {
  initialMode: AuthMode;
  error?: string;
  success?: string;
};

type Point = {
  x: number;
  y: number;
};

const ROPE_ANCHOR: Point = { x: 790, y: 176 };
const ROPE_REST: Point = { x: 790, y: 472 };
const SWITCH_DISTANCE = 105;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getModeFromPathname(): AuthMode {
  return window.location.pathname === "/register" ? "register" : "login";
}

export function AuthPortal({
  initialMode,
  error,
  success,
}: AuthPortalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [lampLit, setLampLit] = useState(initialMode === "login");
  const [contentVisible, setContentVisible] = useState(true);
  const [ropeDragging, setRopeDragging] = useState(false);
  const [ropeTip, setRopeTip] = useState<Point>(ROPE_REST);
  const [message, setMessage] = useState({ error, success });

  const panelRef = useRef<HTMLElement | null>(null);
  const ropeTipRef = useRef<Point>(ROPE_REST);
  const switchingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const setRopePoint = useCallback((point: Point) => {
    ropeTipRef.current = point;
    setRopeTip(point);
  }, []);

  const changeMode = useCallback(
    (nextMode: AuthMode, updateHistory = true) => {
      if (switchingRef.current || nextMode === mode) {
        return;
      }

      switchingRef.current = true;
      setContentVisible(false);
      setLampLit(nextMode === "login");
      setMessage({ error: undefined, success: undefined });

      window.setTimeout(() => {
        if (updateHistory) {
          const nextPath = nextMode === "login" ? "/login" : "/register";
          window.history.pushState({}, "", nextPath);
        }

        setMode(nextMode);

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setContentVisible(true);
          });
        });
      }, 170);

      window.setTimeout(() => {
        switchingRef.current = false;
      }, 470);
    },
    [mode]
  );

  const toggleMode = useCallback(() => {
    changeMode(mode === "login" ? "register" : "login");
  }, [changeMode, mode]);

  const animateRopeBack = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    const startPoint = ropeTipRef.current;
    const startedAt = performance.now();
    const duration = 780;

    function animate(now: number) {
      const progress = clamp((now - startedAt) / duration, 0, 1);

      const spring =
        1 -
        Math.exp(-6.4 * progress) *
          Math.cos(progress * Math.PI * 3.5);

      setRopePoint({
        x: startPoint.x + (ROPE_REST.x - startPoint.x) * spring,
        y: startPoint.y + (ROPE_REST.y - startPoint.y) * spring,
      });

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      animationFrameRef.current = null;
      setRopePoint(ROPE_REST);
    }

    animationFrameRef.current = window.requestAnimationFrame(animate);
  }, [setRopePoint]);

  useEffect(() => {
    function handlePopState() {
      changeMode(getModeFromPathname(), false);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [changeMode]);

  function getPointerPoint(event: ReactPointerEvent<HTMLButtonElement>) {
    const panel = panelRef.current;

    if (!panel) {
      return ROPE_REST;
    }

    const rect = panel.getBoundingClientRect();

    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 1000, 555, 955),
      y: clamp(((event.clientY - rect.top) / rect.height) * 1000, 328, 710),
    };
  }

  function handleRopePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setRopeDragging(true);
  }

  function handleRopePointerMove(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (!ropeDragging) {
      return;
    }

    setRopePoint(getPointerPoint(event));
  }

  function handleRopePointerUp(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (!ropeDragging) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const pullDistance = getDistance(ropeTipRef.current, ROPE_REST);

    setRopeDragging(false);

    if (pullDistance >= SWITCH_DISTANCE) {
      toggleMode();
    }

    animateRopeBack();
  }

  const ropePath = useMemo(() => {
    const horizontalShift = ropeTip.x - ROPE_REST.x;
    const verticalShift = ropeTip.y - ROPE_REST.y;

    const firstControlX = ROPE_ANCHOR.x + horizontalShift * 0.12;
    const firstControlY = ROPE_ANCHOR.y + 92;

    const secondControlX = ropeTip.x - horizontalShift * 0.34;
    const secondControlY = ropeTip.y - 96 - verticalShift * 0.08;

    return `
      M ${ROPE_ANCHOR.x} ${ROPE_ANCHOR.y}
      C ${firstControlX} ${firstControlY},
        ${secondControlX} ${secondControlY},
        ${ropeTip.x} ${ropeTip.y}
    `;
  }, [ropeTip]);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] sm:min-h-[calc(100vh-40px)] md:grid-cols-[0.92fr_1.08fr]">
        <aside
          ref={panelRef}
          className={cn(
            "relative min-h-[430px] touch-none overflow-hidden transition-colors duration-700 md:min-h-full",
            lampLit ? "bg-[#0a2037]" : "bg-[#061426]"
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-700",
              lampLit ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute left-1/2 top-[132px] h-[330px] w-[350px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.28)_0%,rgba(245,158,11,0.12)_38%,transparent_72%)] blur-2xl" />

            <div className="absolute left-1/2 top-[255px] h-[610px] w-[650px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(253,224,71,0.15)_0%,rgba(253,224,71,0.055)_50%,transparent_100%)] [clip-path:polygon(36%_0%,64%_0%,94%_100%,6%_100%)]" />
          </div>

          <svg
            viewBox="0 0 430 430"
            className="pointer-events-none absolute left-1/2 top-0 h-[430px] w-[430px] -translate-x-1/2 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ceiling-base" x1="0" x2="1">
                <stop offset="0%" stopColor="#132335" />
                <stop offset="50%" stopColor="#405268" />
                <stop offset="100%" stopColor="#132335" />
              </linearGradient>

              <linearGradient id="lamp-cord" x1="0" x2="1">
                <stop offset="0%" stopColor="#101827" />
                <stop offset="50%" stopColor="#8493a5" />
                <stop offset="100%" stopColor="#101827" />
              </linearGradient>

              <linearGradient id="lamp-socket" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#637387" />
                <stop offset="45%" stopColor="#334155" />
                <stop offset="100%" stopColor="#172536" />
              </linearGradient>

              <linearGradient id="shade-lit" x1="0" y1="0" x2="0.9" y2="1">
                <stop offset="0%" stopColor="#fff1ac" />
                <stop offset="24%" stopColor="#f8cd59" />
                <stop offset="62%" stopColor="#d9931b" />
                <stop offset="100%" stopColor="#8c5715" />
              </linearGradient>

              <linearGradient id="shade-off" x1="0" y1="0" x2="0.9" y2="1">
                <stop offset="0%" stopColor="#78879a" />
                <stop offset="46%" stopColor="#3b4d62" />
                <stop offset="100%" stopColor="#1a293a" />
              </linearGradient>

              <radialGradient id="glass-lit" cx="35%" cy="28%">
                <stop offset="0%" stopColor="#fffdf2" />
                <stop offset="42%" stopColor="#fff1a5" />
                <stop offset="100%" stopColor="#e7a823" />
              </radialGradient>

              <radialGradient id="glass-off" cx="35%" cy="28%">
                <stop offset="0%" stopColor="#d8e0e8" />
                <stop offset="56%" stopColor="#8794a3" />
                <stop offset="100%" stopColor="#536171" />
              </radialGradient>

              <filter
                id="lamp-glow"
                x="-130%"
                y="-130%"
                width="360%"
                height="360%"
              >
                <feGaussianBlur stdDeviation="16" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="165"
              y="-13"
              width="100"
              height="47"
              rx="17"
              fill="url(#ceiling-base)"
              stroke="rgba(255,255,255,0.14)"
            />

            <rect
              x="213"
              y="34"
              width="4"
              height="126"
              rx="2"
              fill="url(#lamp-cord)"
            />

            <rect
              x="181"
              y="153"
              width="68"
              height="45"
              rx="14"
              fill="url(#lamp-socket)"
              stroke="rgba(255,255,255,0.16)"
            />

            <path
              d="
                M 167 185
                C 178 171, 252 171, 263 185
                L 323 272
                C 333 288, 323 302, 302 302
                L 128 302
                C 107 302, 97 288, 107 272
                Z
              "
              fill={lampLit ? "url(#shade-lit)" : "url(#shade-off)"}
              stroke={
                lampLit
                  ? "rgba(254,240,138,0.74)"
                  : "rgba(255,255,255,0.18)"
              }
              strokeWidth="2"
              className="transition-all duration-700"
            />

            <ellipse
              cx="215"
              cy="292"
              rx="91"
              ry="18"
              fill="rgba(7,13,22,0.55)"
            />

            <ellipse
              cx="215"
              cy="291"
              rx="69"
              ry="11"
              fill={
                lampLit
                  ? "rgba(255,238,154,0.28)"
                  : "rgba(15,23,42,0.48)"
              }
              className="transition-all duration-700"
            />

            <g transform="rotate(180 215 330)">
              <path
                d="
                  M 187 283
                  C 170 301, 173 345, 194 360
                  L 194 374
                  L 236 374
                  L 236 360
                  C 257 345, 260 301, 243 283
                  C 228 267, 202 267, 187 283
                  Z
                "
                fill={lampLit ? "url(#glass-lit)" : "url(#glass-off)"}
                stroke={
                  lampLit
                    ? "#fff5c7"
                    : "rgba(255,255,255,0.30)"
                }
                strokeWidth="2"
                filter={lampLit ? "url(#lamp-glow)" : undefined}
                className="transition-all duration-700"
              />

              <path
                d="
                  M 197 322
                  C 202 307, 228 307, 233 322
                  M 203 324 L 203 350
                  M 227 324 L 227 350
                "
                fill="none"
                stroke={lampLit ? "#b86c0e" : "#536171"}
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-colors duration-700"
              />

              <rect
                x="194"
                y="372"
                width="42"
                height="8"
                rx="3"
                fill="#7a8795"
              />

              <rect
                x="198"
                y="380"
                width="34"
                height="7"
                rx="3"
                fill="#566474"
              />

              <rect
                x="202"
                y="387"
                width="26"
                height="6"
                rx="3"
                fill="#334155"
              />
            </g>
          </svg>

          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d={ropePath}
              fill="none"
              stroke="rgba(8,15,24,0.92)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            <path
              d={ropePath}
              fill="none"
              stroke="rgba(203,213,225,0.68)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>

          <button
            type="button"
            aria-label="Шамның жібін тарту"
            onPointerDown={handleRopePointerDown}
            onPointerMove={handleRopePointerMove}
            onPointerUp={handleRopePointerUp}
            onPointerCancel={handleRopePointerUp}
            className={cn(
              "absolute z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full outline-none transition-transform focus-visible:ring-4 focus-visible:ring-white/25",
              ropeDragging
                ? "scale-110 cursor-grabbing"
                : "cursor-grab hover:scale-105"
            )}
            style={{
              left: `${ropeTip.x / 10}%`,
              top: `${ropeTip.y / 10}%`,
            }}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-[linear-gradient(145deg,#728195_0%,#344459_58%,#182738_100%)] shadow-[0_10px_22px_rgba(0,0,0,0.45)]">
              <span className="h-[18px] w-[18px] rounded-full border border-white/30 bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#d6dee7_42%,#7b8998_100%)] shadow-inner" />
            </span>
          </button>

          <div className="absolute bottom-7 left-1/2 w-full max-w-sm -translate-x-1/2 px-5 text-center md:bottom-10">
            <p className="text-base font-black text-white">
              {lampLit ? "Шам жанып тұр" : "Шам өшірулі"}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/65">
              {lampLit
                ? "Кіру беті ашық. Тіркелу үшін тұтқаны төмен немесе жанға қарай тартыңыз."
                : "Тіркелу беті ашық. Кіру үшін тұтқаны төмен немесе жанға қарай тартыңыз."}
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center p-4 sm:p-6">
          <div
            className={cn(
              "w-full max-w-sm transition-all duration-300",
              contentVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Басты бет
              </Link>

              <button
                type="button"
                onClick={toggleMode}
                className="text-xs font-extrabold text-[var(--primary)] hover:text-[var(--primary-2)]"
              >
                {mode === "login" ? "Тіркелу" : "Кіру"}
              </button>
            </div>

            {mode === "login" ? (
              <div>
                <h1 className="text-xl font-black tracking-[-0.02em] text-[var(--text)]">
                  Аккаунтқа кіру
                </h1>

                <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                  Оқу бағытыңызды жалғастыру үшін деректеріңізді енгізіңіз.
                </p>

                <div className="mt-4">
                  <AuthMessage
                    error={message.error}
                    success={message.success}
                  />
                </div>

                <form action={signInAction} className="mt-4 space-y-3">
                  <Input
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.com"
                    required
                  />

                  <Input
                    id="password"
                    name="password"
                    label="Құпиясөз"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Құпиясөзіңізді енгізіңіз"
                    required
                  />

                  <Button type="submit" className="w-full">
                    <LogIn className="h-4 w-4" />
                    Кіру
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                  Аккаунтыңыз жоқ па?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="font-extrabold text-[var(--primary)] hover:text-[var(--primary-2)]"
                  >
                    Тіркелу
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-black tracking-[-0.02em] text-[var(--text)]">
                  Оқушы ретінде тіркелу
                </h1>

                <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                  Мұғалім және әкімші аккаунттарын жүйе әкімшісі жасайды.
                </p>

                <div className="mt-4">
                  <AuthMessage
                    error={message.error}
                    success={message.success}
                  />
                </div>

                <form
                  action="/register/submit"
                  method="post"
                  className="mt-4 space-y-3"
                >
                  <input type="hidden" name="role" value="student" />

                  <Input
                    id="full_name"
                    name="full_name"
                    label="Аты-жөніңіз"
                    autoComplete="name"
                    placeholder="Мысалы: Айбек Нұрланұлы"
                    required
                  />

                  <Input
                    id="register_email"
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.com"
                    required
                  />

                  <Input
                    id="register_password"
                    name="password"
                    label="Құпиясөз"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Кемінде 6 таңба"
                    hint="Құпиясөз кемінде 6 таңбадан тұруы керек."
                    required
                  />

                  <Button type="submit" className="w-full">
                    <UserPlus className="h-4 w-4" />
                    Тіркелу
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                  Аккаунтыңыз бар ма?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="font-extrabold text-[var(--primary)] hover:text-[var(--primary-2)]"
                  >
                    Кіру
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}