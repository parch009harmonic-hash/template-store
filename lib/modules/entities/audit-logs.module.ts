import { z } from "zod";

import type { Database, Json } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
type AuditLogUpdate = Database["public"]["Tables"]["audit_logs"]["Update"];

export const auditLogCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  actor_profile_id: z.string().uuid().nullable().optional(),
  actor_admin_user_id: z.string().uuid().nullable().optional(),
  action: z.string().min(3).max(120),
  entity_table: z.string().min(1).max(120),
  entity_id: z.string().min(1).max(120),
  old_data: z.record(z.string(), z.unknown()).nullable().optional(),
  new_data: z.record(z.string(), z.unknown()).nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().max(500).nullable().optional()
});

export const auditLogUpdateSchema = z.object({
  old_data: z.record(z.string(), z.unknown()).nullable().optional(),
  new_data: z.record(z.string(), z.unknown()).nullable().optional()
});

export class AuditLogsRepository extends BaseEntityRepository<"audit_logs"> {
  constructor() {
    super("audit_logs");
  }
}

export class AuditLogsService {
  constructor(private readonly repository = new AuditLogsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = auditLogCreateSchema.parse(payload);
    const dto: AuditLogInsert = {
      ...input,
      old_data: (input.old_data ?? null) as Json | null,
      new_data: (input.new_data ?? null) as Json | null
    };
    return this.repository.insert(dto);
  }

  update(id: string, payload: unknown) {
    const input = auditLogUpdateSchema.parse(payload);
    const dto: AuditLogUpdate = {
      old_data: (input.old_data ?? undefined) as Json | undefined,
      new_data: (input.new_data ?? undefined) as Json | undefined
    };
    return this.repository.update(id, dto);
  }
}
