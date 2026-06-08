import { Activity, Atom, Beaker, TrendingUp } from "lucide-react";
import type { TaskPackItem } from "@/lib/taskPacks";

export function PhysicsTaskVisual({ kind, step, formula }: { kind: TaskPackItem["kind"]; step: number; formula?: string | null }) {
  const mode = kind === "lab" ? "Тәжірибе сигналы" : kind === "calculation" ? "Есептеу траекториясы" : "Талдау сигналы";
  const Icon = kind === "lab" ? Beaker : kind === "calculation" ? TrendingUp : Atom;
  const lift = 18 + (step % 5) * 8;

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-[var(--border)] bg-[linear-gradient(135deg,#f8fbff_0%,#f4f1ff_100%)] p-3">
      <div className="absolute inset-0 physics-grid opacity-45" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="data-label text-[var(--primary)]">{mode}</p>
          <p className="mt-1 font-mono text-xs font-black text-[var(--text)]">{formula || "Physics model"}</p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-[3px] border border-[var(--border-accent)] bg-white/80 text-[var(--primary)]">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <svg viewBox="0 0 480 122" className="relative mt-2 h-[96px] w-full" role="img" aria-label="Физикалық тәуелділік анимациясы">
        {[24, 54, 84, 114].map((y) => (
          <line key={y} x1="18" x2="462" y1={y} y2={y} stroke="rgba(115,132,155,.18)" strokeDasharray="4 7" />
        ))}
        <line x1="28" x2="28" y1="12" y2="108" stroke="rgba(66,84,110,.45)" />
        <line x1="28" x2="462" y1="108" y2="108" stroke="rgba(66,84,110,.45)" />
        <polyline
          points={`32,96 104,${88 - lift / 4} 178,${76 - lift / 3} 252,${63 - lift / 2} 328,${48 - lift / 2} 448,${28 - lift / 2}`}
          fill="none"
          stroke="#5747e7"
          strokeWidth="3"
          className="animate-graph"
        />
        {[32, 104, 178, 252, 328, 448].map((x, index) => (
          <circle key={x} cx={x} cy={[96, 88 - lift / 4, 76 - lift / 3, 63 - lift / 2, 48 - lift / 2, 28 - lift / 2][index]} r="4" fill="#fff" stroke="#5747e7" strokeWidth="2.5" className="animate-node" />
        ))}
      </svg>

      <div className="relative flex items-center gap-2 text-[11px] font-bold leading-5 text-[var(--text-muted)]">
        <Activity className="h-3.5 w-3.5 text-[var(--cyan)]" />
        Параметр өзгерген сайын график пен өлшеу логикасын бірге талдаңыз.
      </div>
    </div>
  );
}
