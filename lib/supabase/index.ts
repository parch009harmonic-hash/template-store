export { createAdminSupabaseClient } from "@/lib/supabase/admin";
export { getApiAdminContext, getApiUser } from "@/lib/supabase/api";
export { hasRequiredAdminRole, isAdminRole, type AdminRole, type AppUserRole } from "@/lib/auth/roles";
export {
  getAdminContext,
  getCurrentProfile,
  getCurrentUser,
  requireAdmin,
  requireAdminUser,
  requireAuth,
  requireStaff,
  requireCustomerUser,
  type AdminContext,
  type AuthUser
} from "@/lib/supabase/auth";
export { createBrowserSupabaseClient } from "@/lib/supabase/client";
export { createServerSupabaseClient } from "@/lib/supabase/server";
export type { Database } from "@/lib/supabase/database.types";
export type { AppSupabaseClient, TableInsert, TableRow, TableUpdate } from "@/lib/supabase/types";
