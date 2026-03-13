import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type PromoCampaignInsert = Database["public"]["Tables"]["promo_campaigns"]["Insert"];
type PromoCampaignUpdate = Database["public"]["Tables"]["promo_campaigns"]["Update"];

export const promoCampaignCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().max(1000).nullable().optional(),
  discount_type: z.enum(["percentage", "fixed_amount", "free_item"]),
  discount_value: z.number().nonnegative(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  is_active: z.boolean().default(false)
});

export const promoCampaignUpdateSchema = promoCampaignCreateSchema.partial();

export class PromoCampaignsRepository extends BaseEntityRepository<"promo_campaigns"> {
  constructor() {
    super("promo_campaigns");
  }
}

export class PromoCampaignsService {
  constructor(private readonly repository = new PromoCampaignsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = promoCampaignCreateSchema.parse(payload) as PromoCampaignInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = promoCampaignUpdateSchema.parse(payload) as PromoCampaignUpdate;
    return this.repository.update(id, input);
  }
}
