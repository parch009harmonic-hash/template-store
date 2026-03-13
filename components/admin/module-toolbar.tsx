import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface ModuleToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  ctaLabel: string;
  onCreate: () => void;
}

export function ModuleToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions,
  ctaLabel,
  onCreate
}: ModuleToolbarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
      <Input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="sm:max-w-xs"
      />
      <Select value={filterValue} onChange={(event) => onFilterChange(event.target.value)} className="sm:max-w-xs">
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Button onClick={onCreate} className="sm:ml-auto">
        {ctaLabel}
      </Button>
    </div>
  );
}

