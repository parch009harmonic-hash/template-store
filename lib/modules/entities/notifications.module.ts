import { z } from "zod";

import type { Database, Json } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export const notificationCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  type: z.enum(["general", "promo", "membership", "system"]).default("general"),
  title: z.string().min(1).max(160),
  message: z.string().min(1).max(2000),
  payload: z.record(z.string(), z.unknown()).optional(),
  created_by: z.string().uuid().nullable().optional(),
  read_at: z.string().datetime({ offset: true }).nullable().optional()
});

export const notificationUpdateSchema = notificationCreateSchema.partial();

export class NotificationsRepository extends BaseEntityRepository<"notifications"> {
  constructor() {
    super("notifications");
  }
}

export class NotificationsService {
  constructor(private readonly repository = new NotificationsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = notificationCreateSchema.parse(payload);
    const dto: NotificationInsert = {
      ...input,
      payload: (input.payload ?? {}) as Json
    };
    return this.repository.insert(dto);
  }

  update(id: string, payload: unknown) {
    const input = notificationUpdateSchema.parse(payload);
    const dto: NotificationUpdate = {
      ...input,
      payload: (input.payload ?? undefined) as Json | undefined
    };
    return this.repository.update(id, dto);
  }
}
