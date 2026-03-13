"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "datetime-local";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

interface EntityFormDialogProps {
  open: boolean;
  title: string;
  fields: FormField[];
  initialValues: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

export function EntityFormDialog({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSubmit
}: EntityFormDialogProps) {
  const emptyState = useMemo(() => {
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
  }, [fields]);

  const [formState, setFormState] = useState<Record<string, string>>(emptyState);

  useEffect(() => {
    if (!open) return;
    setFormState({ ...emptyState, ...initialValues });
  }, [emptyState, initialValues, open]);

  if (!open) return null;

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
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(formState);
          }}
        >
          {fields.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="text-sm text-muted-foreground">{field.label}</span>
              {field.type === "textarea" ? (
                <Textarea
                  value={formState[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              ) : field.type === "select" ? (
                <Select
                  value={formState[field.key] ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={field.type ?? "text"}
                  value={formState[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              )}
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
