import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminNav } from "@/components/admin/admin-nav";
import { ResponsiveShell } from "@/components/shared/responsive-shell";
import { requireAdminUser } from "@/lib/supabase/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const adminContext = await requireAdminUser("staff");
  const email = adminContext.user.email ?? "admin@restaurant.local";
  const role = adminContext.role;

  return (
    <ResponsiveShell className="max-w-7xl pb-8">
      <AdminTopbar email={email} role={role} mockMode={false} />
      <div className="mb-4 md:hidden">
        <div className="rounded-2xl border bg-card p-2 shadow-sm">
          <AdminNav orientation="horizontal" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)]">
        <AdminSidebar />
        <div>{children}</div>
      </div>
    </ResponsiveShell>
  );
}
