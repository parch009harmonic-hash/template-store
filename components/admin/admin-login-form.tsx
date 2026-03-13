"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const redirectTo: Route =
    nextPath && nextPath.startsWith("/admin") ? (nextPath as Route) : "/admin";
  const supabase = createBrowserSupabaseClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.error) {
          setErrorMessage(signInResult.error.message);
          setLoading(false);
          return;
        }

        const adminCheck = await fetch("/api/auth/admin/check");
        if (!adminCheck.ok) {
          await supabase.auth.signOut();
          setErrorMessage("This account does not have admin permissions.");
          setLoading(false);
          return;
        }

        router.push(redirectTo);
        router.refresh();
      }}
    >
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <p className="text-sm text-muted-foreground">Sign in with an admin/staff account.</p>

      <Input name="email" type="email" placeholder="Email address" required />
      <Input name="password" type="password" placeholder="Password" required />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Verifying..." : "Sign In"}
      </Button>

      {errorMessage ? <p className="rounded-md bg-[#fde8e8] px-3 py-2 text-sm text-[#9f1d1d]">{errorMessage}</p> : null}
    </form>
  );
}
