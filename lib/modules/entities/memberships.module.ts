import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type MembershipInsert = Database["public"]["Tables"]["memberships"]["Insert"];
type MembershipUpdate = Database["public"]["Tables"]["memberships"]["Update"];

export const membershipCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  points: z.number().int().nonnegative().default(0),
  expires_at: z.string().datetime({ offset: true }).nullable().optional()
});

export const membershipUpdateSchema = membershipCreateSchema.partial();

export class MembershipsRepository extends BaseEntityRepository<"memberships"> {
  constructor() {
    super("memberships");
  }
}

export class MembershipsService {
  constructor(private readonly repository = new MembershipsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = membershipCreateSchema.parse(payload) as MembershipInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = membershipUpdateSchema.parse(payload) as MembershipUpdate;
    return this.repository.update(id, input);
  }
}
