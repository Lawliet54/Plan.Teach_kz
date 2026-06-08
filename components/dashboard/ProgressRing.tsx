type ProgressRingProps = {
  percent: number;
  label?: string;
};

export function ProgressRing({
  percent,
  label = "Прогресс",
}: ProgressRingProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const size = 92;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative grid h-[92px] w-[92px] shrink-0 place-items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>

      <div className="absolute text-center">
        <p className="text-lg font-black text-[var(--text)]">{safePercent}%</p>
        <p className="text-[10px] font-semibold text-[var(--text-muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}