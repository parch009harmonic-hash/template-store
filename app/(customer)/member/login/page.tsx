import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { AuthFormCard } from "@/components/customer/auth-form-card";
import { getServerI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function MemberLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");
  const { messages } = await getServerI18n();

  return (
    <div className="space-y-4 pt-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" />
        {messages.auth.backToHome}
      </Link>
      <AuthFormCard mode="login" />
    </div>
  );
}

