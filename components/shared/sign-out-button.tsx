"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const { messages } = useI18n();

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          variant: "outline",
          className: "w-full justify-start gap-2 border-[#d8b7a0] text-[#9d4c22]"
        }),
        className
      )}
      onClick={async () => {
        await supabase.auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/member/login");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      {messages.profile.signOut}
    </button>
  );
}
