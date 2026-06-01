"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLineGraphPath, clamp, round } from "@/components/labs/_shared";
import type { LabSnapshot } from "@/components/labs/LabLayout";

type Liquid = "су" | "май" | "тұзды су";

const liquidDensity: Record<Liquid, number> = {
  су: 1000,
  май: 900,
  "тұзды су": 1030,
};

export function ArchimedesLawLab({
  snapshot,
  onSnapshotChange,
}: {
  snapshot: LabSnapshot;
  onSnapshotChange: (next: LabSnapshot) => void;
}) {
  const [liquid, setLiquid] = useState<Liquid>("су");
  const [volumeCm3, setVolumeCm3] = useState(200); // cm^3
  const [submergedPct, setSubmergedPct] = useState(60); // %

  const rho = liquidDensity[liquid];
  const g = 9.8;
  const volumeM3 = volumeCm3 / 1_000_000;
  const submergedV = volumeM3 * (submergedPct / 100);

  const Fa = useMemo(() => round(rho * g * submergedV, 3), [rho, submergedV]);

  const graphPoints = useMemo(() => {
    const points = [];
    for (let V = 50; V <= 500; V += 50) {
      const vM3 = V / 1_000_000;
      points.push({ x: V, y: rho * g * vM3 * (submergedPct / 100) });
    }
    return points;
  }, [rho, submergedPct]);

  useEffect(() => {
    onSnapshotChange({
      ...snapshot,
      Сұйықтық: liquid,
      "Дене көлемі": `${volumeCm3} см³`,
      "Бату деңгейі": `${submergedPct}%`,
      "Архимед күші": `${Fa} Н`,
      __graph: graphPoints,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liquid, volumeCm3, submergedPct, Fa, graphPoints]);

  const path = buildLineGraphPath(graphPoints, 320, 140, 18);

  const waterTop = 50;
  const waterBottom = 190;
  const liquidLevel = clamp(waterTop + (1 - submergedPct / 100) * 30, waterTop, waterTop + 30);
  const objectHeight = 70;
  const objectY = 110;
  const submergedHeight = (submergedPct / 100) * objectHeight;

  const buoyArrowLen = clamp(20 + (Fa / 6) * 60, 20, 90);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-700">Басқару панелі</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Сұйықтық түрі</span>
              <select
                aria-label="Сұйықтық түрі"
                value={liquid}
                onChange={(e) => setLiquid(e.target.value as Liquid)}
                className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#ddd6ff]"
              >
                <option value="су">Су</option>
                <option value="май">Май</option>
                <option value="тұзды су">Тұзды су</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Дене көлемі (см³)</span>
              <input
                aria-label="Дене көлемі"
                type="range"
                min={50}
                max={500}
                step={10}
                value={volumeCm3}
                onChange={(e) => setVolumeCm3(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
              />
              <span className="text-xs font-bold text-slate-700">{volumeCm3} см³</span>
            </label>
          </div>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-slate-600">Бату деңгейі (%)</span>
            <input
              aria-label="Бату деңгейі"
              type="range"
              min={0}
              max={100}
              step={1}
              value={submergedPct}
              onChange={(e) => setSubmergedPct(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#5b4ce6]"
            />
            <span className="text-xs font-bold text-slate-700">{submergedPct}%</span>
          </label>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
              Fₐ = ρgV
            </span>
            <span className="rounded-full bg-[#f1efff] px-3 py-1 text-[#5b4ce6]">
              Архимед күші: {Fa} Н
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-3">
          <p className="text-xs font-black text-slate-700">Fₐ(V) графигі</p>
          <svg
            className="mt-2 h-[140px] w-full"
            viewBox="0 0 320 140"
            role="img"
            aria-label="Архимед күшінің көлемге тәуелділігі графигі"
          >
            <rect x="0" y="0" width="320" height="140" fill="#ffffff" />
            <path d="M 18 122 L 302 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M 18 18 L 18 122" stroke="#e2e8f0" strokeWidth="2" />
            <path d={path} stroke="#5b4ce6" strokeWidth="3" fill="none" />
          </svg>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Тығыздық және бату деңгейі артса, Fₐ өседі.
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3">
        <p className="text-xs font-black text-slate-700">2D симуляция</p>
        <svg
          className="mt-2 h-[220px] w-full"
          viewBox="0 0 320 220"
          role="img"
          aria-label="Сұйықтықтағы дене симуляциясы"
        >
          <rect x="0" y="0" width="320" height="220" fill="#f8fafc" />

          <rect x="70" y={waterTop} width="180" height={waterBottom - waterTop} rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="72" y={liquidLevel} width="176" height={waterBottom - liquidLevel - 2} rx="10" fill="#60a5fa" opacity={liquid === "май" ? 0.45 : liquid === "тұзды су" ? 0.55 : 0.5} />

          <rect x="132" y={objectY} width="56" height={objectHeight} rx="10" fill="#0f172a" opacity="0.9" />
          <rect x="132" y={objectY + (objectHeight - submergedHeight)} width="56" height={submergedHeight} rx="10" fill="#5b4ce6" opacity="0.22" />

          <line x1="160" y1={objectY + objectHeight / 2} x2="160" y2={objectY + objectHeight / 2 - buoyArrowLen} stroke="#5b4ce6" strokeWidth="5" strokeLinecap="round" />
          <polygon
            points={`${160},${objectY + objectHeight / 2 - buoyArrowLen - 10} ${154},${objectY + objectHeight / 2 - buoyArrowLen} ${166},${objectY + objectHeight / 2 - buoyArrowLen}`}
            fill="#5b4ce6"
          />
          <text x="160" y={objectY + objectHeight / 2 - buoyArrowLen - 14} textAnchor="middle" fontSize="11" fill="#5b4ce6" fontWeight="800">
            Fₐ={Fa} Н
          </text>

          <text x="18" y="26" fontSize="12" fill="#0f172a" fontWeight="800">
            ρ={rho} кг/м³, V={volumeCm3} см³, бату={submergedPct}%
          </text>
        </svg>
      </div>
    </div>
  );
}

