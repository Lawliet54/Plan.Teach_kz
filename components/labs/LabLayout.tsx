"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import type { LabDefinition } from "@/data/labs";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import {
  LabMeasurementTable,
  type LabMeasurementRow,
  type LabTableColumn,
} from "@/components/labs/LabMeasurementTable";
import { LabResultPanel } from "@/components/labs/LabResultPanel";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "plan-teach-lab-results";

export type LabCompletedResult = {
  labSlug: string;
  measurements: LabMeasurementRow[];
  conclusion: string;
  score: number;
  completedAt: string;
};

export type LabSnapshot = LabMeasurementRow & { __graph?: { x: number; y: number }[] };

export function LabLayout({
  lab,
  columns,
  renderSimulation,
}: {
  lab: LabDefinition;
  columns: LabTableColumn[];
  renderSimulation: (args: {
    snapshot: LabSnapshot;
    onSnapshotChange: (next: LabSnapshot) => void;
  }) => React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<LabSnapshot>({});
  const [measurements, setMeasurements] = useState<LabMeasurementRow[]>([]);
  const [conclusion, setConclusion] = useState("");
  const [savedStatus, setSavedStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LabCompletedResult[];
      const existing = parsed.find((r) => r.labSlug === lab.slug);
      if (!existing) return;
      setMeasurements(existing.measurements || []);
      setConclusion(existing.conclusion || "");
    } catch {
      // ignore
    }
  }, [lab.slug]);

  const canComplete = useMemo(() => {
    return measurements.length >= 3 && conclusion.trim().length >= 20;
  }, [conclusion, measurements.length]);

  const validationMessage = useMemo(() => {
    if (measurements.length < 3) {
      return "Зертхананы аяқтау үшін кемінде 3 өлшеу қосыңыз.";
    }
    if (conclusion.trim().length < 20) {
      return "Қорытынды кемінде 20 таңба болуы керек.";
    }
    return "Барлығы дұрыс. Енді зертхананы аяқтай аласыз.";
  }, [conclusion, measurements.length]);

  const onAddMeasurement = () => {
    const row: LabMeasurementRow = {};
    for (const col of columns) {
      row[col.key] = snapshot[col.key] ?? "—";
    }
    setMeasurements((prev) => [...prev, row]);
    setSavedStatus("idle");
  };

  const onComplete = () => {
    const score = Math.min(100, 40 + measurements.length * 10 + Math.min(40, conclusion.trim().length));
    const result: LabCompletedResult = {
      labSlug: lab.slug,
      measurements,
      conclusion: conclusion.trim(),
      score,
      completedAt: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as LabCompletedResult[]) : [];
      const next = [...existing.filter((r) => r.labSlug !== lab.slug), result];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedStatus("saved");
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button href="/labs" variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Артқа
        </Button>

        {savedStatus === "saved" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            Нәтиже сақталды
          </div>
        ) : null}
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Зертхана
        </p>
        <CardTitle className="mt-2">{lab.title}</CardTitle>
        <CardText className="mt-2">{lab.theorySummary}</CardText>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
            Формула: {lab.formula}
          </span>
          <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[#5b4ce6]">
            {lab.difficulty}
          </span>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
            {lab.estimatedMinutes} мин
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-black text-slate-700">Оқу мақсаттары</p>
          <ul className="mt-2 grid gap-1 text-sm font-semibold text-slate-700">
            {lab.learningGoals.map((goal) => (
              <li key={goal} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b4ce6]" />
                <span className="leading-6">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-3 sm:p-4">
          {renderSimulation({ snapshot, onSnapshotChange: setSnapshot })}
        </Card>

        <LabResultPanel
          measurementsCount={measurements.length}
          conclusion={conclusion}
          setConclusion={setConclusion}
          onAddMeasurement={onAddMeasurement}
          onComplete={onComplete}
          canComplete={canComplete}
          validationMessage={validationMessage}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <LabMeasurementTable columns={columns} rows={measurements} />

        <Card>
          <p className="text-xs font-black text-slate-700">Ескертпе</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Нәтижелер осы құрылғыда сақталады. Егер аккаунтпен синхрондау қажет
            болса, кейін Supabase арқылы қосамыз.
          </p>
          <Link
            href="/results"
            className="mt-3 inline-flex text-xs font-bold text-[#5b4ce6] hover:underline"
          >
            Нәтижелер бөліміне өту
          </Link>
        </Card>
      </div>
    </div>
  );
}
