"use client";

import type { LabDefinition } from "@/data/labs";
import { LabLayout } from "@/components/labs/LabLayout";
import type { LabTableColumn } from "@/components/labs/LabMeasurementTable";

import { NewtonSecondLawLab } from "@/components/labs/NewtonSecondLawLab";
import { HookeLawLab } from "@/components/labs/HookeLawLab";
import { ArchimedesLawLab } from "@/components/labs/ArchimedesLawLab";
import { OhmLawLab } from "@/components/labs/OhmLawLab";
import { ReflectionLawLab } from "@/components/labs/ReflectionLawLab";

export function LabRunner({
  lab,
  columns,
}: {
  lab: LabDefinition;
  columns: LabTableColumn[];
}) {
  return (
    <LabLayout
      lab={lab}
      columns={columns}
      renderSimulation={({ snapshot, onSnapshotChange }) => {
        if (lab.slug === "newton-second-law") {
          return (
            <NewtonSecondLawLab
              snapshot={snapshot}
              onSnapshotChange={onSnapshotChange}
            />
          );
        }

        if (lab.slug === "hooke-law") {
          return (
            <HookeLawLab
              snapshot={snapshot}
              onSnapshotChange={onSnapshotChange}
            />
          );
        }

        if (lab.slug === "archimedes-law") {
          return (
            <ArchimedesLawLab
              snapshot={snapshot}
              onSnapshotChange={onSnapshotChange}
            />
          );
        }

        if (lab.slug === "ohm-law") {
          return (
            <OhmLawLab snapshot={snapshot} onSnapshotChange={onSnapshotChange} />
          );
        }

        return (
          <ReflectionLawLab
            snapshot={snapshot}
            onSnapshotChange={onSnapshotChange}
          />
        );
      }}
    />
  );
}

