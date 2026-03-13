export type AppUserRole = "customer" | "staff" | "admin";
export type AdminRole = "staff" | "admin" | "owner";

const adminRoleRank: Record<AdminRole, number> = {
  staff: 1,
  admin: 2,
  owner: 3
};

export function hasRequiredAdminRole(currentRole: AdminRole, minimumRole: AdminRole) {
  return adminRoleRank[currentRole] >= adminRoleRank[minimumRole];
}

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return value === "staff" || value === "admin" || value === "owner";
}
