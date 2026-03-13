import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileCreateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2).max(120).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  default_restaurant_id: z.string().uuid().nullable().optional()
});

export const profileUpdateSchema = profileCreateSchema.partial().omit({ id: true });

export class ProfilesRepository extends BaseEntityRepository<"profiles"> {
  constructor() {
    super("profiles");
  }
}

export class ProfilesService {
  constructor(private readonly repository = new ProfilesRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = profileCreateSchema.parse(payload) as ProfileInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = profileUpdateSchema.parse(payload) as ProfileUpdate;
    return this.repository.update(id, input);
  }
}
