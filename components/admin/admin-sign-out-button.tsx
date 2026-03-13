"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AdminSignOutButton() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1"
      onClick={async () => {
        await supabase.auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
      Logout
    </Button>
  );
}

