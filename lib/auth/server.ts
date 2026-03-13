import { redirect } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";

import { hasRequiredAdminRole, type AdminRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppSupabaseClient, TableInsert, TableRow } from "@/lib/supabase/types";

export type ProfileRow = TableRow<"profiles">;

export interface AuthContext {
  user: User;
  profile: ProfileRow;
  supabase: AppSupabaseClient;
}

export interface AdminAccessContext extends AuthContext {
  restaurantId: string;
  role: AdminRole;
}

interface AdminAccessOptions {
  restaurantId?: string;
  minimumRole?: AdminRole;
}

function pickBestRole(current: AdminRole | undefined, incoming: AdminRole) {
  if (!current) return incoming;
  return hasRequiredAdminRole(incoming, current) ? incoming : current;
}

function buildProfileSeed(user: User): TableInsert<"profiles"> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim().length > 0
      ? metadata.full_name.trim()
      : user.email ?? null;
  const phone =
    typeof metadata.phone === "string" && metadata.phone.trim().length > 0
      ? metadata.phone.trim()
      : null;
  const avatarUrl =
    typeof metadata.avatar_url === "string" && metadata.avatar_url.trim().length > 0
      ? metadata.avatar_url.trim()
      : null;

  return {
    id: user.id,
    full_name: fullName,
    phone,
    avatar_url: avatarUrl,
    app_role: "customer"
  };
}

async function ensureProfile(
  supabase: AppSupabaseClient,
  user: User
): Promise<ProfileRow> {
  const { data: existingRaw, error: readError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    throw new Error(`Unable to read profile: ${readError.message}`);
  }

  const existing = (existingRaw ?? null) as ProfileRow | null;
  if (existing) return existing;

  const profileSeed = buildProfileSeed(user);
  const { data: createdRaw, error: createError } = await supabase
    .from("profiles")
    .insert(profileSeed as never)
    .select("*")
    .single();

  if (!createError && createdRaw) {
    return createdRaw as ProfileRow;
  }

  const { data: retryRaw, error: retryError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (retryError || !retryRaw) {
    throw new Error(createError?.message ?? retryError?.message ?? "Unable to provision profile");
  }

  return retryRaw as ProfileRow;
}

async function getCurrentUserWithClient(supabase: AppSupabaseClient): Promise<User | null> {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

async function resolveAdminAccess(
  supabase: AppSupabaseClient,
  user: User,
  profile: ProfileRow,
  options: AdminAccessOptions
): Promise<AdminAccessContext | null> {
  const minimumRole = options.minimumRole ?? "staff";

  const [{ data: adminRowsRaw }, { data: ownerRowsRaw }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("restaurant_id, role")
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_profile_id", user.id)
      .is("deleted_at", null)
  ]);

  const roleByRestaurant = new Map<string, AdminRole>();

  for (const row of (adminRowsRaw ?? []) as Array<{ restaurant_id: string; role: AdminRole }>) {
    const current = roleByRestaurant.get(row.restaurant_id);
    roleByRestaurant.set(row.restaurant_id, pickBestRole(current, row.role));
  }

  for (const row of (ownerRowsRaw ?? []) as Array<{ id: string }>) {
    roleByRestaurant.set(row.id, "owner");
  }

  if (!roleByRestaurant.size) return null;

  const preferredRestaurantId =
    options.restaurantId ??
    (profile.default_restaurant_id && roleByRestaurant.has(profile.default_restaurant_id)
      ? profile.default_restaurant_id
      : Array.from(roleByRestaurant.keys())[0]);

  if (!preferredRestaurantId) return null;

  const role = roleByRestaurant.get(preferredRestaurantId);
  if (!role || !hasRequiredAdminRole(role, minimumRole)) return null;

  return {
    user,
    profile,
    supabase,
    restaurantId: preferredRestaurantId,
    role
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  return getCurrentUserWithClient(supabase);
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getCurrentUserWithClient(supabase);
  if (!user) return null;
  return ensureProfile(supabase, user);
}

export async function requireAuth(redirectTo: Route = "/member/login"): Promise<AuthContext> {
  const supabase = await createServerSupabaseClient();
  const user = await getCurrentUserWithClient(supabase);

  if (!user) {
    redirect(redirectTo);
  }

  const profile = await ensureProfile(supabase, user);
  return { user, profile, supabase };
}

export async function getAdminAccess(options: AdminAccessOptions = {}): Promise<AdminAccessContext | null> {
  const supabase = await createServerSupabaseClient();
  const user = await getCurrentUserWithClient(supabase);
  if (!user) return null;

  const profile = await ensureProfile(supabase, user);
  return resolveAdminAccess(supabase, user, profile, options);
}

export async function requireStaff(
  options: Omit<AdminAccessOptions, "minimumRole"> = {}
): Promise<AdminAccessContext> {
  const access = await getAdminAccess({ ...options, minimumRole: "staff" });
  if (!access) {
    redirect("/admin/login");
  }
  return access;
}

export async function requireAdmin(
  options: Omit<AdminAccessOptions, "minimumRole"> = {}
): Promise<AdminAccessContext> {
  const access = await getAdminAccess({ ...options, minimumRole: "admin" });
  if (!access) {
    redirect("/admin/login");
  }
  return access;
}
