"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLineGraphPath, clamp, round } from "@/components/labs/_shared";
import type { LabSnapshot } from "@/components/labs/LabLayout";

export function HookeLawLab({
  snapshot,
  onSnapshotChange,
}: {
  snapshot: LabSnapshot;
  onSnapshotChange: (next: LabSnapshot) => void;
}) {
  const [k, setK] = useState(50); // N/m
  const [mass, setMass] = useState(0.5); // kg

  const g = 9.8;
  const F = useMemo(() => round(mass * g, 2), [mass]);
  const x = useMemo(() => round(F / k, 3), [F, k]); // m

  const graphPoints = useMemo(() => {
    const points = [];
    for (let ext = 0; ext <= 0.6; ext += 0.05) {
      points.push({ x: ext, y: k * ext });
    }
    return points;
  }, [k]);

  useEffect(() => {
    onSnapshotChange({
      ...snapshot,
      Масса: `${mass.toFixed(2)} кг`,
      "Ауырлық күші": `${F} Н`,
      "Серіппенің ұзаруы": `${x} м`,
      __graph: graphPoints,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, mass, F, x, graphPoints]);

  const path = buildLineGraphPath(graphPoints, 320, 140, 18);

  const baseY = 30;
  const springTop = 40;
  const springBottom = 120;
  const maxExt = 0.6;
  const extPx = clamp((x / maxExt) * 70, 0, 70);
  const massY = springBottom + extPx;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-700">Басқару панелі</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Серіппе қатаңдығы (Н/м)
              </span>
              <input
                aria-label="Серіппе қатаңдығы"
                type="range"
                min={20}
                max={100}
                step={1}
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{k} Н/м</span>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Жүк массасы (кг)</span>
              <input
                aria-label="Жүк массасы"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{mass.toFixed(2)} кг</span>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">F = mg</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">x = F / k</span>
            <span className="rounded-full bg-[#f1efff] px-3 py-1 text-[#5b4ce6]">
              Ұзару: {x} м
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-3">
          <p className="text-xs font-black text-slate-700">F(x) графигі</p>
          <svg
            className="mt-2 h-[140px] w-full"
            viewBox="0 0 320 140"
            role="img"
            aria-label="Күштің ұзаруға тәуелділігі графигі"
          >
            <rect x="0" y="0" width="320" height="140" fill="#ffffff" />
            <path d="M 18 122 L 302 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M 18 18 L 18 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d={path} stroke="#5b4ce6" strokeWidth="3" fill="none" />
          </svg>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Қатаңдық жоғары болса, график тік болады.
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3">
        <p className="text-xs font-black text-slate-700">2D симуляция</p>
        <svg
          className="mt-2 h-[220px] w-full"
          viewBox="0 0 320 220"
          role="img"
          aria-label="Серіппе және жүк симуляциясы"
        >
          <rect x="0" y="0" width="320" height="220" fill="#f8fafc" />

          <rect x="70" y={baseY} width="180" height="16" rx="8" fill="#0f172a" opacity="0.92" />
          <rect x="156" y={baseY + 16} width="8" height="12" rx="4" fill="#334155" />

          <g>
            <path
              d={`M 160 ${springTop} 
                C 150 ${springTop + 10}, 170 ${springTop + 20}, 160 ${springTop + 30}
                C 150 ${springTop + 40}, 170 ${springTop + 50}, 160 ${springTop + 60}
                C 150 ${springTop + 70}, 170 ${springTop + 80}, 160 ${springTop + 90}
                C 150 ${springTop + 100 + extPx / 2}, 170 ${springTop + 110 + extPx}, 160 ${springBottom + extPx}`}
              stroke="#5b4ce6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          <rect x="132" y={massY} width="56" height="44" rx="10" fill="#0f172a" opacity="0.9" style={{ transition: "y 180ms ease-out" }} />
          <text x="160" y={massY + 26} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="800">
            m={mass.toFixed(2)}кг
          </text>

          <line x1="260" y1="50" x2="260" y2="200" stroke="#cbd5e1" strokeWidth="2" />
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i}>
              <line x1="254" y1={70 + i * 20} x2="266" y2={70 + i * 20} stroke="#94a3b8" strokeWidth="2" />
            </g>
          ))}
          <text x="270" y="66" fontSize="10" fill="#64748b" fontWeight="700">
            сызғыш
          </text>

          <text x="18" y="26" fontSize="12" fill="#0f172a" fontWeight="800">
            F={F} Н, x={x} м
          </text>
        </svg>
      </div>
    </div>
  );
}

