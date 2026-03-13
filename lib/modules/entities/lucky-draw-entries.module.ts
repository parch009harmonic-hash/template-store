import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type LuckyDrawEntryInsert = Database["public"]["Tables"]["lucky_draw_entries"]["Insert"];
type LuckyDrawEntryUpdate = Database["public"]["Tables"]["lucky_draw_entries"]["Update"];

export const luckyDrawEntryCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  membership_id: z.string().uuid().nullable().optional(),
  lucky_draw_campaign_id: z.string().uuid().nullable().optional(),
  campaign_id: z.string().uuid().nullable().optional(),
  points_spent: z.number().int().nonnegative().default(0),
  status: z.enum(["pending", "won", "lost", "claimed"]).default("pending"),
  won_prize: z.string().max(255).nullable().optional()
});

export const luckyDrawEntryUpdateSchema = luckyDrawEntryCreateSchema.partial();

export class LuckyDrawEntriesRepository extends BaseEntityRepository<"lucky_draw_entries"> {
  constructor() {
    super("lucky_draw_entries");
  }
}

export class LuckyDrawEntriesService {
  constructor(private readonly repository = new LuckyDrawEntriesRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = luckyDrawEntryCreateSchema.parse(payload) as LuckyDrawEntryInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = luckyDrawEntryUpdateSchema.parse(payload) as LuckyDrawEntryUpdate;
    return this.repository.update(id, input);
  }
}
