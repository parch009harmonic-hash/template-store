import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export const categoryCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true)
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export class CategoriesRepository extends BaseEntityRepository<"categories"> {
  constructor() {
    super("categories");
  }
}

export class CategoriesService {
  constructor(private readonly repository = new CategoriesRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = categoryCreateSchema.parse(payload) as CategoryInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = categoryUpdateSchema.parse(payload) as CategoryUpdate;
    return this.repository.update(id, input);
  }
}
