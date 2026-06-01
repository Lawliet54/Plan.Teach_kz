"use client";

import { useEffect, useMemo, useState } from "react";

import { clamp, round } from "@/components/labs/_shared";
import type { LabSnapshot } from "@/components/labs/LabLayout";

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function ReflectionLawLab({
  snapshot,
  onSnapshotChange,
}: {
  snapshot: LabSnapshot;
  onSnapshotChange: (next: LabSnapshot) => void;
}) {
  const [alpha, setAlpha] = useState(35); // degrees

  const beta = useMemo(() => alpha, [alpha]);

  useEffect(() => {
    onSnapshotChange({
      ...snapshot,
      "Түсу бұрышы": `${alpha}°`,
      "Шағылу бұрышы": `${beta}°`,
      __graph: [
        { x: 0, y: 0 },
        { x: alpha, y: beta },
        { x: 80, y: 80 },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alpha, beta]);

  const originX = 160;
  const originY = 120;

  const rayLen = 90;
  const aRad = degToRad(alpha);
  const incidentX = originX - Math.sin(aRad) * rayLen;
  const incidentY = originY - Math.cos(aRad) * rayLen;
  const reflectedX = originX + Math.sin(aRad) * rayLen;
  const reflectedY = originY - Math.cos(aRad) * rayLen;

  const arcR = 28;
  const arcSweep = clamp(alpha, 0, 80);
  const arcEndX = originX - Math.sin(degToRad(arcSweep)) * arcR;
  const arcEndY = originY - Math.cos(degToRad(arcSweep)) * arcR;

  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-700">Басқару панелі</p>

        <label className="mt-3 grid gap-1">
          <span className="text-xs font-bold text-slate-600">Түсу бұрышы (°)</span>
          <input
            aria-label="Түсу бұрышы"
            type="range"
            min={0}
            max={80}
            step={1}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
          />
          <span className="text-xs font-bold text-slate-700">{alpha}°</span>
        </label>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white px-3 py-1 text-slate-700">α = β</span>
          <span className="rounded-full bg-[#f1efff] px-3 py-1 text-[#5b4ce6]">
            β = {beta}°
          </span>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3">
        <p className="text-xs font-black text-slate-700">2D симуляция</p>
        <svg
          className="mt-2 h-[240px] w-full"
          viewBox="0 0 320 240"
          role="img"
          aria-label="Айнадағы жарық шағылуы симуляциясы"
        >
          <rect x="0" y="0" width="320" height="240" fill="#f8fafc" />

          <line x1="40" y1={originY} x2="280" y2={originY} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          <text x="280" y={originY - 10} fontSize="10" fill="#334155" fontWeight="800" textAnchor="end">
            айна
          </text>

          <line x1={originX} y1="30" x2={originX} y2="210" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
          <text x={originX + 6} y="44" fontSize="10" fill="#64748b" fontWeight="800">
            нормаль
          </text>

          <line x1={incidentX} y1={incidentY} x2={originX} y2={originY} stroke="#5b4ce6" strokeWidth="4" strokeLinecap="round" />
          <circle cx={incidentX} cy={incidentY} r="4" fill="#5b4ce6" />
          <text x={incidentX - 6} y={incidentY - 8} fontSize="10" fill="#5b4ce6" fontWeight="800" textAnchor="end">
            түсу
          </text>

          <line x1={originX} y1={originY} x2={reflectedX} y2={reflectedY} stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
          <circle cx={reflectedX} cy={reflectedY} r="4" fill="#0ea5e9" />
          <text x={reflectedX + 6} y={reflectedY - 8} fontSize="10" fill="#0ea5e9" fontWeight="800">
            шағылу
          </text>

          <path
            d={`M ${originX} ${originY - arcR} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`}
            stroke="#5b4ce6"
            strokeWidth="3"
            fill="none"
          />
          <text x={originX - 50} y={originY - 36} fontSize="11" fill="#5b4ce6" fontWeight="900">
            α={round(alpha, 0)}°
          </text>
          <text x={originX + 20} y={originY - 36} fontSize="11" fill="#0ea5e9" fontWeight="900">
            β={round(beta, 0)}°
          </text>

          <text x="18" y="26" fontSize="12" fill="#0f172a" fontWeight="800">
            α = {alpha}°, β = {beta}°
          </text>
        </svg>

        <div className="mt-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          Бұл зертханада α өзгерсе, β дәл сол мәнге тең болатынын көресіз.
        </div>
      </div>
    </div>
  );
}

