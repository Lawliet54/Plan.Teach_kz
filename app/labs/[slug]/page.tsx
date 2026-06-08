import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getStudentEntryPath } from "@/lib/auth";
import { getLabDefinition } from "@/data/labs";
import { LabRunner } from "@/components/labs/LabRunner";

const labColumns: Record<string, { key: string; label: string }[]> = {
  "newton-second-law": [
    { key: "Масса", label: "Масса" },
    { key: "Күш", label: "Күш" },
    { key: "Үдеу", label: "Үдеу" },
  ],
  "hooke-law": [
    { key: "Масса", label: "Масса" },
    { key: "Ауырлық күші", label: "Ауырлық күші" },
    { key: "Серіппенің ұзаруы", label: "Серіппенің ұзаруы" },
  ],
  "archimedes-law": [
    { key: "Сұйықтық", label: "Сұйықтық" },
    { key: "Дене көлемі", label: "Дене көлемі" },
    { key: "Бату деңгейі", label: "Бату деңгейі" },
    { key: "Архимед күші", label: "Архимед күші" },
  ],
  "ohm-law": [
    { key: "Кернеу", label: "Кернеу" },
    { key: "Кедергі", label: "Кедергі" },
    { key: "Ток күші", label: "Ток күші" },
  ],
  "reflection-law": [
    { key: "Түсу бұрышы", label: "Түсу бұрышы" },
    { key: "Шағылу бұрышы", label: "Шағылу бұрышы" },
  ],
};

type LabDetailPageProps = { params: Promise<{ slug: string }> };

export default async function LabDetailPage(props: LabDetailPageProps) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const entryPath = getStudentEntryPath(profile);
  if (entryPath !== "/dashboard") {
    redirect(entryPath);
  }

  const params = await props.params;
  const lab = getLabDefinition(params.slug);

  if (!lab) {
    notFound();
  }

  const columns = labColumns[lab.slug];
  if (!columns) {
    notFound();
  }

  return (
    <AppShell profile={profile} active="/labs">
      <LabRunner lab={lab} columns={columns} />
    </AppShell>
  );
}
