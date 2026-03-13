import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type AdminUserInsert = Database["public"]["Tables"]["admin_users"]["Insert"];
type AdminUserUpdate = Database["public"]["Tables"]["admin_users"]["Update"];

export const adminUserCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  role: z.enum(["staff", "admin", "owner"]).default("staff"),
  is_active: z.boolean().default(true),
  invited_by: z.string().uuid().nullable().optional()
});

export const adminUserUpdateSchema = adminUserCreateSchema.partial();

export class AdminUsersRepository extends BaseEntityRepository<"admin_users"> {
  constructor() {
    super("admin_users");
  }
}

export class AdminUsersService {
  constructor(private readonly repository = new AdminUsersRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = adminUserCreateSchema.parse(payload) as AdminUserInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = adminUserUpdateSchema.parse(payload) as AdminUserUpdate;
    return this.repository.update(id, input);
  }
}
