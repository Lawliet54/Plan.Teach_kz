import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/Card";
import type { LabDefinition } from "@/data/labs";

export function LabCard({ lab }: { lab: LabDefinition }) {
  return (
    <Link href={`/labs/${lab.slug}`} className="group block">
      <Card className="h-full transition group-hover:border-[#ddd6ff] group-hover:shadow-[0_12px_30px_rgba(91,76,230,0.08)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
            <FlaskConical className="h-5 w-5 text-[#5b4ce6]" />
          </div>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {lab.formula}
          </span>
        </div>
        <CardTitle>{lab.title}</CardTitle>
        <CardText className="mt-1">{lab.description}</CardText>
      </Card>
    </Link>
  );
}

