"use client";

import { cn } from "@/lib/utils";

export type LabTableColumn = {
  key: string;
  label: string;
};

export type LabMeasurementRow = Record<string, unknown>;

export function LabMeasurementTable({
  columns,
  rows,
  className,
}: {
  columns: LabTableColumn[];
  rows: LabMeasurementRow[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[10px] border border-slate-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-2 font-black text-slate-700"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-3 text-[13px] font-semibold text-slate-500"
                >
                  Өлшеулер әлі қосылған жоқ. Параметрлерді өзгертіп, өлшеуді
                  кестеге енгізіңіз.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-2 font-semibold text-slate-700">
                      {row[col.key] === null || row[col.key] === undefined
                        ? "—"
                        : typeof row[col.key] === "string" || typeof row[col.key] === "number"
                          ? String(row[col.key])
                          : "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
