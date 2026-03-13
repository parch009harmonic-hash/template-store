"use client";

import type { AdminColumn, AdminRow } from "@/components/admin/admin-data-table";
import { Button } from "@/components/ui/button";

interface EntityViewDialogProps {
  open: boolean;
  title: string;
  row: AdminRow | null;
  columns: AdminColumn[];
  onClose: () => void;
}

function formatValue(value: AdminRow[keyof AdminRow]) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function EntityViewDialog({ open, title, row, columns, onClose }: EntityViewDialogProps) {
  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 px-4">
      <div className="w-full max-w-lg rounded-xl border bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          {columns.map((column) => (
            <div key={`${row.id}-${column.key}`} className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">{column.label}</p>
              <p className="col-span-2 text-sm font-medium">{formatValue(row[column.key])}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
