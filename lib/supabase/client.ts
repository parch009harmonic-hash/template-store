"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

