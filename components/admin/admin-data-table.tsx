import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export interface AdminColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

export type AdminRowValue = string | number | boolean | null | undefined;
export type AdminRow = Record<string, AdminRowValue> & { id: string };
export type SortDirection = "asc" | "desc";

export interface AdminSortState {
  key: string;
  direction: SortDirection;
}

interface AdminDataTableProps {
  columns: AdminColumn[];
  rows: AdminRow[];
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  sort: AdminSortState | null;
  onSortChange: (next: AdminSortState | null) => void;
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
  pageSizeOptions?: number[];
  emptyMessage?: string;
}

function asBadge(columnKey: string) {
  return columnKey.includes("status") || columnKey.includes("tier");
}

function getSortIcon(columnKey: string, sort: AdminSortState | null) {
  if (!sort || sort.key !== columnKey) return "<>";
  return sort.direction === "asc" ? "^" : "v";
}

function getNextSort(columnKey: string, currentSort: AdminSortState | null): AdminSortState | null {
  if (!currentSort || currentSort.key !== columnKey) {
    return { key: columnKey, direction: "asc" };
  }

  if (currentSort.direction === "asc") {
    return { key: columnKey, direction: "desc" };
  }

  return null;
}

function getBadgeVariant(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized === "active" ||
    normalized === "available" ||
    normalized === "sent" ||
    normalized === "gold" ||
    normalized === "platinum"
  ) {
    return "default" as const;
  }

  if (normalized === "scheduled" || normalized === "low stock" || normalized === "silver") {
    return "secondary" as const;
  }

  return "outline" as const;
}

function formatValue(value: AdminRowValue) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function AdminDataTable({
  columns,
  rows,
  onEdit,
  onView,
  onDelete,
  sort,
  onSortChange,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = "No data matched your search/filter."
}: AdminDataTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const rowStart = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rowEnd = totalRows === 0 ? 0 : Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => {
                const sortable = column.sortable ?? true;
                return (
                  <th
                    key={column.key}
                    className={`px-3 py-2 text-left font-medium text-muted-foreground ${column.className ?? ""}`.trim()}
                  >
                    {sortable ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-8 px-2 text-muted-foreground"
                        onClick={() => onSortChange(getNextSort(column.key, sort))}
                      >
                        <span>{column.label}</span>
                        <span className="ml-1 text-xs">{getSortIcon(column.key, sort)}</span>
                      </Button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {columns.map((column) => {
                    const value = row[column.key];
                    const formatted = formatValue(value);
                    return (
                      <td key={`${row.id}-${column.key}`} className={`px-3 py-2 ${column.className ?? ""}`.trim()}>
                        {asBadge(column.key) ? (
                          <Badge variant={getBadgeVariant(formatted)}>{formatted}</Badge>
                        ) : (
                          formatted
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {onView ? (
                        <Button size="sm" variant="ghost" onClick={() => onView(row.id)}>
                          View
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => onEdit(row.id)}>
                        Edit
                      </Button>
                      {onDelete ? (
                        <Button size="sm" variant="ghost" onClick={() => onDelete(row.id)}>
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={columns.length + 1}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t px-3 py-3 text-sm sm:flex-row sm:items-center">
        <p className="text-muted-foreground">
          Showing {rowStart}-{rowEnd} of {totalRows}
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 w-20"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="outline" onClick={() => onPageChange(1)} disabled={currentPage <= 1}>
            First
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Prev
          </Button>
          <span className="min-w-16 text-center text-muted-foreground">
            {currentPage}/{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
