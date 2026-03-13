import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type PushSubscriptionInsert = Database["public"]["Tables"]["push_subscriptions"]["Insert"];
type PushSubscriptionUpdate = Database["public"]["Tables"]["push_subscriptions"]["Update"];

export const pushSubscriptionCreateSchema = z.object({
  profile_id: z.string().uuid(),
  restaurant_id: z.string().uuid().nullable().optional(),
  endpoint: z.string().url(),
  p256dh: z.string().min(8),
  auth: z.string().min(8),
  user_agent: z.string().max(500).nullable().optional(),
  is_active: z.boolean().default(true)
});

export const pushSubscriptionUpdateSchema = pushSubscriptionCreateSchema.partial();

export class PushSubscriptionsRepository extends BaseEntityRepository<"push_subscriptions"> {
  constructor() {
    super("push_subscriptions");
  }
}

export class PushSubscriptionsService {
  constructor(private readonly repository = new PushSubscriptionsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = pushSubscriptionCreateSchema.parse(payload) as PushSubscriptionInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = pushSubscriptionUpdateSchema.parse(payload) as PushSubscriptionUpdate;
    return this.repository.update(id, input);
  }
}
