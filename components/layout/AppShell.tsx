"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Atom,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  Home,
  LineChart,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppShellProps = {
  profile: Profile;
  active?: string;
  children: React.ReactNode;
  hideTopbar?: boolean;
  contentClassName?: string;
};

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
    </span>
  );
}

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: NavItem["icon"];
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center rounded-lg border transition",
        active
          ? "border-white/20 bg-white/15 text-white shadow-[0_8px_20px_rgba(91,76,230,0.18)]"
          : "border-white/10 bg-transparent text-white/75 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Басты бет", icon: Home },
  { href: "/topics", label: "Тақырыптар", icon: BookOpen },
  { href: "/results", label: "Нәтижелер", icon: LineChart },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/ai", label: "AI көмекші", icon: MessageCircle },
  { href: "/profile", label: "Жеке кабинет", icon: User },
];

const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Басты бет", icon: Home },
  { href: "/teacher/students", label: "Оқушылар", icon: UsersRound },
  { href: "/teacher/submissions", label: "Тексеру", icon: ClipboardCheck },
  { href: "/teacher/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/teacher/controls", label: "БЖБ / ТЖБ", icon: BookOpen },
  { href: "/profile", label: "Жеке кабинет", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Админ панель", icon: ShieldCheck },
  { href: "/teacher/dashboard", label: "Мұғалім көрінісі", icon: UsersRound },
  { href: "/learn", label: "Контент", icon: BookOpen },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/profile", label: "Жеке кабинет", icon: Settings },
];

export function AppShell({
  profile,
  active,
  children,
  hideTopbar = false,
  contentClassName,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useMemo(() => {
    if (profile.role === "admin") {
      return adminNav;
    }

    if (profile.role === "teacher") {
      return teacherNav;
    }

    return studentNav;
  }, [profile.role]);

  const displayName = profile.full_name || profile.email || "Қолданушы";
  const roleLabel =
    profile.role === "teacher"
      ? "Мұғалім"
      : profile.role === "admin"
        ? "Әкімші"
        : "Оқушы";

  return (
    <div className="h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      <div className="h-screen md:grid md:grid-cols-[260px_1fr]">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Мәзірді жабу"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        ) : null}

        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-full w-[260px] transform border-r border-white/10 bg-[linear-gradient(180deg,var(--sidebar)_0%,var(--sidebar-2)_100%)] shadow-[18px_0_42px_rgba(16,33,63,0.16)] transition-transform duration-200 md:static md:block md:h-auto md:translate-x-0 md:opacity-100 md:transition-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full min-h-0 flex-col px-2.5 py-3 sm:px-3.5 sm:py-4">
            <div className="flex shrink-0 items-center justify-between gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex min-w-0 items-center gap-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--primary-2))] text-white shadow-[0_0_18px_rgba(91,76,230,0.40)]">
                  <Atom className="h-[18px] w-[18px]" />
                </span>

                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-extrabold text-white">
                    Plan.Teach_kz
                  </span>
                  <span className="block truncate text-[10px] font-semibold text-white/65">
                    Адаптивті оқу платформасы
                  </span>
                </span>
              </Link>

              <button
                type="button"
                aria-label="Мәзірді жабу"
                onClick={() => setSidebarOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/80 md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 small-scrollbar">
              <div className="grid gap-1">
                <div className="px-2 pb-1.5 text-[9px] font-bold uppercase text-white/45 sm:px-3">
                  Навигация
                </div>

                {nav.map((item) => {
                  const isActive =
                    active === item.href ||
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      item.href !== "/teacher/dashboard" &&
                      item.href !== "/admin/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl border px-2 py-1.5 transition sm:gap-2.5 sm:px-2.5",
                        isActive
                          ? "border-white/20 bg-[linear-gradient(90deg,rgba(91,76,230,0.42),rgba(255,255,255,0.08))] text-white shadow-[0_10px_26px_rgba(0,0,0,0.16)]"
                          : "border-transparent text-[var(--sidebar-text)] hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <NavIcon icon={item.icon} active={isActive} />

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[12px] font-semibold sm:text-[13px]",
                            isActive ? "text-white" : "text-[var(--sidebar-text)]"
                          )}
                        >
                          {item.label}
                        </span>

                        {isActive ? (
                          <span className="mt-0.5 block text-[9px] text-white/55 sm:text-[10px]">
                            Қазір осы бөлімдесіз
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-2 sm:pt-3">
              <div className="rounded-xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(91,76,230,0.14))] p-2.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold sm:text-[13px]">
                    AI көмекші
                  </div>
                  <Dots />
                </div>

                <div className="mt-1 text-[10px] text-white/70 sm:text-[11px]">
                  Сұрағыңыз бар ма? Түсіндіруге көмектесемін.
                </div>

                <Link
                  href="/ai"
                  onClick={() => setSidebarOpen(false)}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(91,76,230,0.26)] hover:bg-[var(--primary-2)] sm:text-[13px]"
                >
                  Сұрақ қою
                </Link>
              </div>

              <form action={signOutAction} className="mt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/90 hover:bg-white/10 sm:text-[13px]"
                >
                  <LogOut className="h-4 w-4" />
                  Шығу
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          {hideTopbar ? null : (
            <header className="z-10 shrink-0 border-b border-[var(--border)] bg-white/88 backdrop-blur">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="grid h-9 w-9 place-items-center rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)] hover:bg-[var(--surface-muted)] sm:h-10 sm:w-10 md:hidden"
                  aria-label="Мәзірді ашу"
                >
                  <Menu className="h-[18px] w-[18px]" />
                </button>

                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-extrabold text-[var(--text)]">
                    {profile.role === "teacher"
                      ? "Мұғалім панелі"
                      : profile.role === "admin"
                        ? "Админ панель"
                        : "Оқушы кабинеті"}
                  </p>
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    7-11 сынып физикасы
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="relative grid h-9 w-9 place-items-center rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)] hover:bg-[var(--surface-muted)] sm:h-10 sm:w-10"
                  aria-label="Хабарламалар"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--primary)]" />
                </button>

                <div className="hidden items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 shadow-[var(--shadow)] sm:flex">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface-muted)] text-sm font-bold text-[var(--primary)]">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <div className="max-w-[180px] truncate text-sm font-semibold text-[var(--text)]">
                      {displayName}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {roleLabel}
                    </div>
                  </div>
                </div>

                <div className="grid h-9 w-9 place-items-center rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)] sm:hidden">
                  <div className="grid h-7 w-7 place-items-center rounded-xl bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary)]">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
              </div>
            </header>
          )}

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div
              className={cn(
                "mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-5",
                contentClassName
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
