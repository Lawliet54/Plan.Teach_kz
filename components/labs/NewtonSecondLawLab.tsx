"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { clamp, round, buildLineGraphPath } from "@/components/labs/_shared";
import type { LabSnapshot } from "@/components/labs/LabLayout";

export function NewtonSecondLawLab({
  snapshot,
  onSnapshotChange,
}: {
  snapshot: LabSnapshot;
  onSnapshotChange: (next: LabSnapshot) => void;
}) {
  const [mass, setMass] = useState(5); // kg
  const [force, setForce] = useState(20); // N

  const acceleration = useMemo(() => round(force / mass, 2), [force, mass]);

  const graphPoints = useMemo(() => {
    const points = [];
    for (let F = 0; F <= 50; F += 5) {
      points.push({ x: F, y: F / mass });
    }
    return points;
  }, [mass]);

  useEffect(() => {
    onSnapshotChange({
      ...snapshot,
      Масса: `${mass} кг`,
      Күш: `${force} Н`,
      Үдеу: `${acceleration} м/с²`,
      __graph: graphPoints,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass, force, acceleration, graphPoints]);

  const cartX = clamp(40 + (force / 50) * 180, 40, 240);
  const arrowLen = clamp(20 + (force / 50) * 90, 20, 110);

  const path = buildLineGraphPath(graphPoints, 320, 140, 18);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-700">Басқару панелі</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Масса (кг)</span>
              <input
                aria-label="Масса"
                type="range"
                min={1}
                max={10}
                step={1}
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{mass} кг</span>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Күш (Н)</span>
              <input
                aria-label="Күш"
                type="range"
                min={1}
                max={50}
                step={1}
                value={force}
                onChange={(e) => setForce(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{force} Н</span>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
              a = F / m
            </span>
            <span className="rounded-full bg-[#f1efff] px-3 py-1 text-[#5b4ce6]">
              Үдеу: {acceleration} м/с²
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-3">
          <p className="text-xs font-black text-slate-700">a(F) графигі</p>
          <svg
            className="mt-2 h-[140px] w-full"
            viewBox="0 0 320 140"
            role="img"
            aria-label="Үдеудің күшке тәуелділігі графигі"
          >
            <rect x="0" y="0" width="320" height="140" fill="#ffffff" />
            <path d="M 18 122 L 302 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M 18 18 L 18 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d={path} stroke="#5b4ce6" strokeWidth="3" fill="none" />
          </svg>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Масса тұрақты болғанда a күшпен сызықты өседі.
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3">
        <p className="text-xs font-black text-slate-700">2D симуляция</p>
        <svg
          className="mt-2 h-[190px] w-full"
          viewBox="0 0 320 190"
          role="img"
          aria-label="Арба және рельс симуляциясы"
        >
          <rect x="0" y="0" width="320" height="190" fill="#f8fafc" />

          <line x1="18" y1="150" x2="302" y2="150" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <line x1="18" y1="158" x2="302" y2="158" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

          <g style={{ transition: "transform 220ms ease-out" }} transform={`translate(${cartX - 40}, 0)`}>
            <rect x="40" y="108" width="80" height="34" rx="10" fill="#0f172a" opacity="0.92" />
            <rect x="48" y="115" width="28" height="8" rx="4" fill="#5b4ce6" opacity="0.9" />
            <circle cx="58" cy="146" r="8" fill="#334155" />
            <circle cx="102" cy="146" r="8" fill="#334155" />

            <line
              x1="120"
              y1="125"
              x2={120 + arrowLen}
              y2="125"
              stroke="#5b4ce6"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <g transform={`translate(${120 + arrowLen - 6}, 119)`}>
              <ArrowRight className="h-4 w-4 text-[#5b4ce6]" />
            </g>
            <text x={120 + arrowLen / 2} y="114" textAnchor="middle" fontSize="11" fill="#5b4ce6" fontWeight="700">
              F = {force} Н
            </text>
          </g>

          <text x="18" y="24" fontSize="12" fill="#0f172a" fontWeight="800">
            Үдеу: {acceleration} м/с²
          </text>
          <text x="18" y="44" fontSize="11" fill="#475569" fontWeight="700">
            Масса: {mass} кг
          </text>
        </svg>
      </div>
    </div>
  );
}

