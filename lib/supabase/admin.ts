import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServiceRoleEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: ReturnType<typeof createClient<Database>> | undefined;

export function createAdminSupabaseClient() {
  if (adminClient) return adminClient;

  const { supabaseUrl } = getPublicEnv();
  const { serviceRoleKey } = getServiceRoleEnv();

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}
