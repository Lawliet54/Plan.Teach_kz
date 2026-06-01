"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLineGraphPath, clamp, round } from "@/components/labs/_shared";
import type { LabSnapshot } from "@/components/labs/LabLayout";

export function OhmLawLab({
  snapshot,
  onSnapshotChange,
}: {
  snapshot: LabSnapshot;
  onSnapshotChange: (next: LabSnapshot) => void;
}) {
  const [U, setU] = useState(6); // V
  const [R, setR] = useState(10); // Ohm

  const I = useMemo(() => round(U / R, 3), [U, R]); // A

  const graphPoints = useMemo(() => {
    const points = [];
    for (let u = 0; u <= 12; u += 1) {
      points.push({ x: u, y: u / R });
    }
    return points;
  }, [R]);

  useEffect(() => {
    onSnapshotChange({
      ...snapshot,
      Кернеу: `${U} В`,
      Кедергі: `${R} Ом`,
      "Ток күші": `${I} А`,
      __graph: graphPoints,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [U, R, I, graphPoints]);

  const path = buildLineGraphPath(graphPoints, 320, 140, 18);

  const needleX = clamp(80 + (I / (12 / R)) * 160, 80, 240);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-700">Басқару панелі</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Кернеу (В)</span>
              <input
                aria-label="Кернеу"
                type="range"
                min={1}
                max={12}
                step={1}
                value={U}
                onChange={(e) => setU(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{U} В</span>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Кедергі (Ом)</span>
              <input
                aria-label="Кедергі"
                type="range"
                min={1}
                max={20}
                step={1}
                value={R}
                onChange={(e) => setR(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{R} Ом</span>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
              I = U / R
            </span>
            <span className="rounded-full bg-[#f1efff] px-3 py-1 text-[#5b4ce6]">
              I = {I} А
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-3">
          <p className="text-xs font-black text-slate-700">I(U) графигі</p>
          <svg
            className="mt-2 h-[140px] w-full"
            viewBox="0 0 320 140"
            role="img"
            aria-label="Ток күшінің кернеуге тәуелділігі графигі"
          >
            <rect x="0" y="0" width="320" height="140" fill="#ffffff" />
            <path d="M 18 122 L 302 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M 18 18 L 18 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d={path} stroke="#5b4ce6" strokeWidth="3" fill="none" />
          </svg>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Кедергі артса, график еңісі кішірейеді.
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3">
        <p className="text-xs font-black text-slate-700">2D симуляция</p>
        <svg
          className="mt-2 h-[220px] w-full"
          viewBox="0 0 320 220"
          role="img"
          aria-label="Электр тізбегі симуляциясы"
        >
          <rect x="0" y="0" width="320" height="220" fill="#f8fafc" />

          <rect x="30" y="70" width="70" height="80" rx="12" fill="#0f172a" opacity="0.9" />
          <rect x="40" y="85" width="12" height="50" rx="6" fill="#ffffff" opacity="0.85" />
          <rect x="65" y="95" width="12" height="40" rx="6" fill="#ffffff" opacity="0.55" />
          <text x="65" y="165" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="800">
            Батарея {U}В
          </text>

          <path d="M 100 110 L 140 110" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <path d="M 180 110 L 220 110" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

          <rect x="140" y="92" width="40" height="36" rx="10" fill="#5b4ce6" opacity="0.9" />
          <text x="160" y="115" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="800">
            R={R}Ω
          </text>

          <rect x="232" y="80" width="68" height="60" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <text x="266" y="104" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="900">
            A
          </text>
          <line x1="246" y1="120" x2="286" y2="120" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          <circle cx={needleX} cy="120" r="5" fill="#5b4ce6" />
          <text x="266" y="152" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="800">
            I={I}A
          </text>

          <text x="18" y="26" fontSize="12" fill="#0f172a" fontWeight="800">
            U={U} В, R={R} Ом → I={I} А
          </text>
        </svg>
      </div>
    </div>
  );
}

