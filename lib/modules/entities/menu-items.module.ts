import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

export const menuItemCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  price: z.number().nonnegative(),
  image_url: z.string().url().nullable().optional(),
  sku: z.string().max(60).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_available: z.boolean().default(true)
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export class MenuItemsRepository extends BaseEntityRepository<"menu_items"> {
  constructor() {
    super("menu_items");
  }
}

export class MenuItemsService {
  constructor(private readonly repository = new MenuItemsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = menuItemCreateSchema.parse(payload) as MenuItemInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = menuItemUpdateSchema.parse(payload) as MenuItemUpdate;
    return this.repository.update(id, input);
  }
}
