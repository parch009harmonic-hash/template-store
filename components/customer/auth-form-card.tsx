"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { useI18n } from "@/components/shared/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  mode: "login" | "register";
  redirectTo?: Route;
}

export function AuthFormCard({ mode, redirectTo = "/profile" }: AuthFormCardProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const { messages } = useI18n();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">
        {mode === "login" ? messages.auth.loginTitle : messages.auth.registerTitle}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "login"
          ? messages.auth.loginDescription
          : messages.auth.registerDescription}
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setErrorMessage(null);
          setSuccessMessage(null);

          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "");
          const phone = String(formData.get("phone") ?? "");
          const password = String(formData.get("password") ?? "");
          const fullName = String(formData.get("fullName") ?? "");

          if (mode === "register") {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName,
                  phone
                }
              }
            });

            if (error) {
              setErrorMessage(error.message);
              setLoading(false);
              return;
            }

            setSuccessMessage(messages.auth.registerSuccess);
            setLoading(false);
            return;
          }

          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
          }

          router.push(redirectTo);
          router.refresh();
        }}
      >
        {mode === "register" ? (
          <Input name="fullName" placeholder={messages.auth.fullNamePlaceholder} required />
        ) : null}
        <Input name="email" type="email" placeholder={messages.auth.emailPlaceholder} required />
        {mode === "register" ? (
          <Input name="phone" placeholder={messages.auth.phonePlaceholder} required />
        ) : null}
        <Input name="password" type="password" placeholder={messages.auth.passwordPlaceholder} required />

        <button
          type="submit"
          className={cn(
            buttonVariants(),
            "w-full bg-[#d15b13] text-white hover:bg-[#b94e11]"
          )}
          disabled={loading}
        >
          {loading ? messages.auth.processing : mode === "login" ? messages.auth.signIn : messages.auth.createAccount}
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-3 rounded-md bg-[#fde8e8] px-3 py-2 text-sm text-[#9f1d1d]">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 rounded-md bg-[#f5e8dc] px-3 py-2 text-sm text-[#8a4b19]">
          {successMessage}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "login" ? messages.auth.newMember : messages.auth.alreadyHaveAccount}{" "}
        <Link
          href={mode === "login" ? "/member/register" : "/member/login"}
          className="font-medium text-primary"
        >
          {mode === "login" ? messages.auth.createAccountLink : messages.auth.loginHereLink}
        </Link>
      </p>
    </section>
  );
}
