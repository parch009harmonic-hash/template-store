import type { AdminRole } from "@/types/domain";

export const ADMIN_ROLES: AdminRole[] = ["staff", "admin", "owner"];

export function canManageRestaurant(role: AdminRole) {
  return ADMIN_ROLES.includes(role);
}

export function canManageAccess(role: AdminRole) {
  return role === "admin" || role === "owner";
}

