import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { BaseEntityRepository } from "@/lib/modules/shared/base-entity.repository";

type RestaurantInsert = Database["public"]["Tables"]["restaurants"]["Insert"];
type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"];

export const restaurantCreateSchema = z.object({
  owner_profile_id: z.string().uuid(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(1000).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  timezone: z.string().default("Asia/Bangkok"),
  currency_code: z.string().length(3).default("THB")
});

export const restaurantUpdateSchema = restaurantCreateSchema.partial();

export class RestaurantsRepository extends BaseEntityRepository<"restaurants"> {
  constructor() {
    super("restaurants");
  }
}

export class RestaurantsService {
  constructor(private readonly repository = new RestaurantsRepository()) {}

  list() {
    return this.repository.list();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(payload: unknown) {
    const input = restaurantCreateSchema.parse(payload) as RestaurantInsert;
    return this.repository.insert(input);
  }

  update(id: string, payload: unknown) {
    const input = restaurantUpdateSchema.parse(payload) as RestaurantUpdate;
    return this.repository.update(id, input);
  }
}
