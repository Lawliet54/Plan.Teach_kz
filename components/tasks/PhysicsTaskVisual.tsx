import { Activity, TrendingUp } from "lucide-react";

import type { TaskPackItem } from "@/lib/taskPacks";

export function shouldShowTaskVisual(item: TaskPackItem) {
  if (item.kind === "lab") {
    return false;
  }

  const title = item.title.toLocaleLowerCase("kk-KZ");
  const hasGraphSkill = item.skill_codes?.includes("graph_analysis") ?? false;

  return (
    hasGraphSkill ||
    title.includes("график") ||
    title.includes("тәуелділік")
  );
}

export function PhysicsTaskVisual({
  item,
  formula,
}: {
  item: TaskPackItem;
  formula?: string | null;
}) {
  const lift = 18 + (item.order_index % 5) * 7;

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-[var(--border)] bg-[linear-gradient(135deg,#fbfcff_0%,#f6f4ff_100%)] p-3">
      <div className="absolute inset-0 physics-grid opacity-35" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="data-label text-[var(--primary)]">
            Қажетті графиктік тірек
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
            {item.kind === "calculation"
              ? "Кесте мен графикті құру үлгісі"
              : "Графикті талдауға арналған үлгі"}
          </p>

          <p className="mt-1 font-mono text-xs font-medium text-[var(--text-soft)]">
            {formula || "Физикалық тәуелділік"}
          </p>
        </div>

        <span className="grid h-8 w-8 place-items-center rounded-[7px] border border-[var(--border-accent)] bg-white/85 text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" />
        </span>
      </div>

      <svg
        viewBox="0 0 480 122"
        className="relative mt-2 h-[92px] w-full"
        role="img"
        aria-label="Тапсырмаға қатысты графиктік үлгі"
      >
        {[24, 54, 84, 114].map((y) => (
          <line
            key={y}
            x1="18"
            x2="462"
            y1={y}
            y2={y}
            stroke="rgba(115,132,155,.18)"
            strokeDasharray="4 7"
          />
        ))}

        <line
          x1="28"
          x2="28"
          y1="12"
          y2="108"
          stroke="rgba(66,84,110,.45)"
        />

        <line
          x1="28"
          x2="462"
          y1="108"
          y2="108"
          stroke="rgba(66,84,110,.45)"
        />

        <polyline
          points={`32,96 104,${88 - lift / 4} 178,${76 - lift / 3} 252,${63 - lift / 2} 328,${48 - lift / 2} 448,${28 - lift / 2}`}
          fill="none"
          stroke="#6556e5"
          strokeWidth="3"
          className="animate-graph"
        />

        {[32, 104, 178, 252, 328, 448].map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={
              [
                96,
                88 - lift / 4,
                76 - lift / 3,
                63 - lift / 2,
                48 - lift / 2,
                28 - lift / 2,
              ][index]
            }
            r="4"
            fill="#fff"
            stroke="#6556e5"
            strokeWidth="2.5"
          />
        ))}

        <text
          x="454"
          y="120"
          textAnchor="end"
          fontSize="10"
          fill="#7a7f99"
        >
          x
        </text>

        <text
          x="15"
          y="18"
          textAnchor="middle"
          fontSize="10"
          fill="#7a7f99"
        >
          y
        </text>
      </svg>

      <div className="relative flex items-center gap-2 text-[11px] font-medium leading-5 text-[var(--text-muted)]">
        <Activity className="h-3.5 w-3.5 text-[var(--cyan)]" />
        Осьтерді физикалық шамалармен және өлшем бірліктерімен белгілеңіз.
      </div>
    </div>
  );
}
