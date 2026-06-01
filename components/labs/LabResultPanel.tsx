"use client";

import { CheckCircle2, Info } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function LabResultPanel({
  measurementsCount,
  conclusion,
  setConclusion,
  onAddMeasurement,
  onComplete,
  canComplete,
  validationMessage,
  className,
}: {
  measurementsCount: number;
  conclusion: string;
  setConclusion: (value: string) => void;
  onAddMeasurement: () => void;
  onComplete: () => void;
  canComplete: boolean;
  validationMessage: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      <div className="grid gap-2 rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-start gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1efff]">
            <Info className="h-4 w-4 text-[#5b4ce6]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950">Тексеру</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
              {validationMessage}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={onAddMeasurement} variant="secondary">
            Өлшеуді кестеге қосу
          </Button>

          <span className="text-xs font-bold text-slate-600">
            Өлшеулер: {measurementsCount} / 3
          </span>
        </div>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <label className="text-xs font-black text-slate-700" htmlFor="lab-conclusion">
          Қорытынды
        </label>
        <textarea
          id="lab-conclusion"
          aria-label="Қорытынды"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#ddd6ff]"
          placeholder="Кемінде 20 таңба жазыңыз..."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
          <CheckCircle2 className={cn("h-4 w-4", canComplete ? "text-emerald-600" : "text-slate-300")} />
          {canComplete ? "Дайын" : "Әлі дайын емес"}
        </div>

        <Button onClick={onComplete} disabled={!canComplete}>
          Зертхананы аяқтау
        </Button>
      </div>
    </div>
  );
}

