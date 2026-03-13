import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { hasRequiredAdminRole, type AdminRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppSupabaseClient } from "@/lib/supabase/types";

type ServerSupabaseClient = AppSupabaseClient;

type ApiUserSuccess = {
  user: User;
  supabase: ServerSupabaseClient;
  error: null;
};

type ApiUserFailure = {
  user: null;
  supabase: ServerSupabaseClient;
  error: NextResponse;
};

export async function getApiUser(): Promise<ApiUserSuccess | ApiUserFailure> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      supabase,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    user,
    supabase,
    error: null
  };
}

type ApiAdminSuccess = {
  user: User;
  supabase: ServerSupabaseClient;
  restaurantId: string;
  role: AdminRole;
  error: null;
};

type ApiAdminFailure = {
  user: User | null;
  supabase: ServerSupabaseClient;
  error: NextResponse;
};

export async function getApiAdminContext(
  restaurantId?: string,
  minimumRole: AdminRole = "staff"
): Promise<ApiAdminSuccess | ApiAdminFailure> {
  const auth = await getApiUser();
  if (auth.error) {
    return {
      user: null,
      supabase: auth.supabase,
      error: auth.error
    };
  }

  const { user, supabase } = auth;

  const { data: adminRows } = await supabase
    .from("admin_users")
    .select("restaurant_id, role")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null);

  const { data: ownerRows } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_profile_id", user.id)
    .is("deleted_at", null);

  const roleByRestaurant = new Map<string, AdminRole>();

  for (const row of (adminRows ?? []) as Array<{ restaurant_id: string; role: AdminRole }>) {
    const current = roleByRestaurant.get(row.restaurant_id);
    if (!current || hasRequiredAdminRole(row.role, current)) {
      roleByRestaurant.set(row.restaurant_id, row.role);
    }
  }

  for (const row of (ownerRows ?? []) as Array<{ id: string }>) {
    roleByRestaurant.set(row.id, "owner");
  }

  const restaurantIds = new Set<string>(roleByRestaurant.keys());

  if (restaurantIds.size === 0) {
    return {
      user,
      supabase,
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 })
    };
  }

  const selectedRestaurantId = restaurantId ?? Array.from(restaurantIds)[0];
  if (!selectedRestaurantId || !restaurantIds.has(selectedRestaurantId)) {
    return {
      user,
      supabase,
      error: NextResponse.json({ error: "Restaurant access denied" }, { status: 403 })
    };
  }

  const selectedRole = roleByRestaurant.get(selectedRestaurantId);
  if (!selectedRole || !hasRequiredAdminRole(selectedRole, minimumRole)) {
    return {
      user,
      supabase,
      error: NextResponse.json({ error: "Insufficient role permissions" }, { status: 403 })
    };
  }

  return {
    user,
    supabase,
    restaurantId: selectedRestaurantId,
    role: selectedRole,
    error: null
  };
}
