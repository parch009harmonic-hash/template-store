import Link from "next/link";
import { Store } from "lucide-react";

import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { Badge } from "@/components/ui/badge";

interface AdminTopbarProps {
  email: string;
  role: string;
  mockMode: boolean;
}

export function AdminTopbar({ email, role, mockMode }: AdminTopbarProps) {
  return (
    <header className="mb-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Admin Console</p>
          <h1 className="text-2xl font-semibold">Restaurant Operations</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {email} ({role})
            </p>
            {mockMode ? (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Mock Mode
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium"
          >
            <Store className="h-3.5 w-3.5" />
            Customer View
          </Link>
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}
