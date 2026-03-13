import { AdminNav } from "@/components/admin/admin-nav";

export function AdminSidebar() {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-4 rounded-2xl border bg-card p-3 shadow-sm">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Modules
        </p>
        <AdminNav orientation="vertical" />
      </div>
    </aside>
  );
}
