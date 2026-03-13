import type { AdminRole } from "@/lib/auth/roles";
import {
  getAdminAccess,
  getCurrentProfile as getCurrentProfileInternal,
  getCurrentUser as getCurrentUserInternal,
  requireAdmin as requireAdminInternal,
  requireAuth as requireAuthInternal,
  requireStaff as requireStaffInternal,
  type ProfileRow
} from "@/lib/auth/server";

export interface AuthUser {
  id: string;
  email: string | undefined;
}

export interface AdminContext {
  user: AuthUser;
  restaurantId: string;
  role: AdminRole;
}

function mapAuthUser(user: { id: string; email?: string | null }): AuthUser {
  return {
    id: user.id,
    email: user.email ?? undefined
  } satisfies AuthUser;
}

export async function getCurrentUser() {
  const user = await getCurrentUserInternal();
  if (!user) return null;
  return mapAuthUser(user);
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  return getCurrentProfileInternal();
}

export async function requireAuth() {
  const context = await requireAuthInternal();
  return mapAuthUser(context.user);
}

export async function requireCustomerUser() {
  return requireAuth();
}

export async function getAdminContext(minimumRole: AdminRole = "staff"): Promise<AdminContext | null> {
  const context = await getAdminAccess({ minimumRole });
  if (!context) return null;

  return {
    user: mapAuthUser(context.user),
    restaurantId: context.restaurantId,
    role: context.role
  };
}

export async function requireStaff() {
  const context = await requireStaffInternal();
  return {
    user: mapAuthUser(context.user),
    restaurantId: context.restaurantId,
    role: context.role
  } satisfies AdminContext;
}

export async function requireAdmin() {
  const context = await requireAdminInternal();
  return {
    user: mapAuthUser(context.user),
    restaurantId: context.restaurantId,
    role: context.role
  } satisfies AdminContext;
}

export async function requireAdminUser(minimumRole: AdminRole = "staff") {
  if (minimumRole === "admin") {
    return requireAdmin();
  }

  const context = await requireStaff();
  return context;
}

export async function requireAdminRole(minimumRole: AdminRole) {
  return requireAdminUser(minimumRole);
}
