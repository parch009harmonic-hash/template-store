"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AdminDataTable,
  type AdminColumn,
  type AdminRowValue,
  type AdminRow,
  type AdminSortState
} from "@/components/admin/admin-data-table";
import { EntityFormDialog, type FormField } from "@/components/admin/entity-form-dialog";
import { EntityViewDialog } from "@/components/admin/entity-view-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ModuleToolbar } from "@/components/admin/module-toolbar";
import { SummaryCards } from "@/components/admin/summary-cards";
import type { DashboardMetric } from "@/lib/mock/admin";

interface FilterOption {
  value: string;
  label: string;
}

type FieldValueType = "string" | "number" | "boolean" | "nullable_string" | "iso_datetime";

interface ManagementApiConfig {
  mode?: "mock" | "live";
  restaurantId: string | null;
  listEndpoint: string;
  itemEndpoint: string;
  restaurantIdKey?: "restaurantId" | "restaurant_id";
  fieldTypes?: Record<string, FieldValueType>;
}

interface ManagementModuleProps {
  title: string;
  description: string;
  ctaLabel: string;
  summary: DashboardMetric[];
  rows: AdminRow[];
  columns: AdminColumn[];
  searchKeys: string[];
  searchPlaceholder?: string;
  filterKey?: string;
  filterOptions?: FilterOption[];
  formFields: FormField[];
  api?: ManagementApiConfig;
}

interface ApiListResponse {
  data?: Array<Record<string, unknown>>;
  total?: number;
  error?: string;
}

interface ApiItemResponse {
  data?: Record<string, unknown>;
  error?: string;
}

function normalizeRowValue(value: unknown): AdminRowValue {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return JSON.stringify(value);
}

function toAdminRow(raw: Record<string, unknown>, index: number): AdminRow {
  const normalized: Record<string, AdminRowValue> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = normalizeRowValue(value);
  }

  const id = raw.id ? String(raw.id) : `row-${index}`;
  return { ...normalized, id };
}

function parseFieldValue(rawValue: string, valueType: FieldValueType) {
  if (valueType === "number") {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (valueType === "boolean") {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    return Boolean(rawValue);
  }

  if (valueType === "nullable_string") {
    const trimmed = rawValue.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  if (valueType === "iso_datetime") {
    if (!rawValue) return null;
    return new Date(rawValue).toISOString();
  }

  return rawValue;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function ManagementModule({
  title,
  description,
  ctaLabel,
  summary,
  rows,
  columns,
  searchKeys,
  searchPlaceholder,
  filterKey = "status",
  filterOptions = [
    { value: "all", label: "All" },
    { value: "Active", label: "Active" },
    { value: "Draft", label: "Draft" }
  ],
  formFields,
  api
}: ManagementModuleProps) {
  const isLiveMode = Boolean(
    api &&
      api.mode === "live" &&
      api.restaurantId &&
      api.listEndpoint.length > 0 &&
      api.itemEndpoint.length > 0
  );

  const [dataRows, setDataRows] = useState(rows);
  const [remoteRows, setRemoteRows] = useState<AdminRow[]>([]);
  const [remoteTotalRows, setRemoteTotalRows] = useState(0);
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewingRow, setViewingRow] = useState<AdminRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [sort, setSort] = useState<AdminSortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDataRows(rows);
  }, [rows]);

  const localSelectedRow = useMemo(() => dataRows.find((row) => row.id === selectedId) ?? null, [dataRows, selectedId]);
  const selectedRow = useMemo(() => {
    if (!selectedId) return null;
    if (isLiveMode) {
      return remoteRows.find((row) => row.id === selectedId) ?? localSelectedRow;
    }
    return localSelectedRow;
  }, [isLiveMode, localSelectedRow, remoteRows, selectedId]);

  const initialFormValues = useMemo<Record<string, string>>(() => {
    if (!selectedRow) return {};
    const dateTimeFieldKeys = new Set(
      formFields.filter((field) => field.type === "datetime-local").map((field) => field.key)
    );

    return Object.entries(selectedRow).reduce<Record<string, string>>((acc, [key, value]) => {
      if (key === "id") return acc;
      if (value === null || value === undefined) {
        acc[key] = "";
      } else if (dateTimeFieldKeys.has(key)) {
        acc[key] = toDateTimeLocal(String(value));
      } else {
        acc[key] = String(value);
      }
      return acc;
    }, {});
  }, [formFields, selectedRow]);

  const fetchLiveRows = useCallback(async () => {
    if (!isLiveMode || !api?.restaurantId) return;

    setTableLoading(true);
    setTableError(null);

    const params = new URLSearchParams({
      restaurantId: api.restaurantId,
      page: String(page),
      pageSize: String(pageSize)
    });

    if (query.trim()) params.set("query", query.trim());
    if (filterValue !== "all") {
      params.set("filterKey", filterKey);
      params.set("filterValue", filterValue);
    }
    if (sort) {
      params.set("sortBy", sort.key);
      params.set("sortOrder", sort.direction);
    }

    try {
      const response = await fetch(`${api.listEndpoint}?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiListResponse;
      if (!response.ok) {
        setTableError(payload.error ?? "Unable to load records.");
        setRemoteRows([]);
        setRemoteTotalRows(0);
        return;
      }

      const mappedRows = (payload.data ?? []).map((row, index) => toAdminRow(row, index));
      setRemoteRows(mappedRows);
      setRemoteTotalRows(typeof payload.total === "number" ? payload.total : mappedRows.length);
    } catch {
      setTableError("Unable to load records.");
      setRemoteRows([]);
      setRemoteTotalRows(0);
    } finally {
      setTableLoading(false);
    }
  }, [api, filterKey, filterValue, isLiveMode, page, pageSize, query, sort]);

  useEffect(() => {
    if (!isLiveMode) return;
    void fetchLiveRows();
  }, [fetchLiveRows, isLiveMode]);

  const filteredRows = useMemo(() => {
    return dataRows.filter((row) => {
      const queryMatched =
        query.trim().length === 0 ||
        searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(query.trim().toLowerCase()));

      const filterMatched =
        filterValue === "all" || String(row[filterKey] ?? "").toLowerCase() === filterValue.toLowerCase();

      return queryMatched && filterMatched;
    });
  }, [dataRows, filterKey, filterValue, query, searchKeys]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return [...filteredRows].sort((left, right) => {
      const leftValue = String(left[sort.key] ?? "");
      const rightValue = String(right[sort.key] ?? "");
      const compared = collator.compare(leftValue, rightValue);
      return sort.direction === "asc" ? compared : -compared;
    });
  }, [filteredRows, sort]);

  const localTotalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil((isLiveMode ? remoteTotalRows : localTotalRows) / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, filterValue, sort, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [page, pageSize, sortedRows]);

  const tableRows = isLiveMode ? remoteRows : pagedRows;
  const totalRows = isLiveMode ? remoteTotalRows : localTotalRows;
  const tableEmptyMessage = tableLoading ? "Loading data..." : "No data matched your search/filter.";

  async function handleOpenView(id: string) {
    if (!isLiveMode || !api?.restaurantId) {
      const found = dataRows.find((row) => row.id === id) ?? null;
      setViewingId(id);
      setViewingRow(found);
      setViewDialogOpen(true);
      return;
    }

    setTableLoading(true);
    setTableError(null);
    try {
      const params = new URLSearchParams({ restaurantId: api.restaurantId });
      const response = await fetch(`${api.itemEndpoint}/${id}?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiItemResponse;
      if (!response.ok || !payload.data) {
        setTableError(payload.error ?? "Unable to load details.");
        return;
      }

      setViewingId(id);
      setViewingRow(toAdminRow(payload.data, 0));
      setViewDialogOpen(true);
    } catch {
      setTableError("Unable to load details.");
    } finally {
      setTableLoading(false);
    }
  }

  async function handleSubmit(values: Record<string, string>) {
    if (!isLiveMode || !api?.restaurantId) {
      if (selectedRow) {
        setDataRows((prev) => prev.map((row) => (row.id === selectedRow.id ? { ...row, ...values } : row)));
      } else {
        const newRow = { id: `new-${Date.now()}`, ...values };
        setDataRows((prev) => [newRow, ...prev]);
      }
      setDialogOpen(false);
      return;
    }

    setSaving(true);
    setTableError(null);
    const fieldTypes = api.fieldTypes ?? {};
    const parsed = Object.entries(values).reduce<Record<string, unknown>>((acc, [key, value]) => {
      const valueType = fieldTypes[key] ?? "string";
      acc[key] = parseFieldValue(value, valueType);
      return acc;
    }, {});

    const restaurantIdKey = api.restaurantIdKey ?? "restaurant_id";
    parsed[restaurantIdKey] = api.restaurantId;

    const endpoint = selectedRow ? `${api.itemEndpoint}/${selectedRow.id}` : api.listEndpoint;
    const method = selectedRow ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const payload = (await response.json()) as ApiItemResponse;
      if (!response.ok) {
        setTableError(payload.error ?? "Unable to save data.");
        return;
      }

      setDialogOpen(false);
      setSelectedId(null);
      await fetchLiveRows();
    } catch {
      setTableError("Unable to save data.");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    const id = pendingDeleteId;
    if (!id) return;

    if (!isLiveMode || !api?.restaurantId) {
      setDataRows((prev) => prev.filter((row) => row.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setDialogOpen(false);
      }
      if (viewingId === id) {
        setViewingId(null);
        setViewingRow(null);
        setViewDialogOpen(false);
      }
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
      return;
    }

    setDeleting(true);
    setTableError(null);
    const params = new URLSearchParams({ restaurantId: api.restaurantId });
    const payload = {
      restaurantId: api.restaurantId,
      restaurant_id: api.restaurantId
    };

    try {
      const response = await fetch(`${api.itemEndpoint}/${id}?${params.toString()}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const responsePayload = (await response.json()) as ApiItemResponse;
      if (!response.ok) {
        setTableError(responsePayload.error ?? "Unable to delete data.");
        return;
      }

      if (selectedId === id) {
        setSelectedId(null);
        setDialogOpen(false);
      }
      if (viewingId === id) {
        setViewingId(null);
        setViewingRow(null);
        setViewDialogOpen(false);
      }
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
      await fetchLiveRows();
    } catch {
      setTableError("Unable to delete data.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <SummaryCards metrics={summary} />

      <ModuleToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={filterOptions}
        ctaLabel={ctaLabel}
        onCreate={() => {
          setSelectedId(null);
          setDialogOpen(true);
        }}
      />

      {tableError ? <p className="text-sm text-[#9f1d1d]">{tableError}</p> : null}

      <AdminDataTable
        columns={columns}
        rows={tableRows}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        sort={sort}
        onSortChange={setSort}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        onView={(id) => void handleOpenView(id)}
        onEdit={(id) => {
          setSelectedId(id);
          setDialogOpen(true);
        }}
        onDelete={requestDelete}
        emptyMessage={tableEmptyMessage}
      />

      <EntityFormDialog
        open={dialogOpen}
        title={selectedRow ? `Edit ${title}` : `Create ${title}`}
        fields={formFields}
        initialValues={initialFormValues}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />

      <EntityViewDialog
        open={viewDialogOpen}
        title={`${title} Details`}
        row={viewingRow}
        columns={columns}
        onClose={() => {
          setViewDialogOpen(false);
          setViewingRow(null);
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Record"
        description="This action cannot be undone. Do you want to continue?"
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deleting) return;
          setDeleteDialogOpen(false);
          setPendingDeleteId(null);
        }}
      />

      {saving ? <p className="text-sm text-muted-foreground">Saving...</p> : null}
    </section>
  );
}
