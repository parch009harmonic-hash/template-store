import type {
  AppSupabaseClient,
  TableInsert,
  TableRow,
  TableUpdate
} from "@/lib/supabase/types";

export type CategoryRow = TableRow<"categories">;
export type CategoryInsert = TableInsert<"categories">;
export type CategoryUpdate = TableUpdate<"categories">;

export async function listCategories(client: AppSupabaseClient, restaurantId: string) {
  return client
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
}

export async function getCategoryById(
  client: AppSupabaseClient,
  restaurantId: string,
  categoryId: string
) {
  return client
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function createCategory(client: AppSupabaseClient, input: CategoryInsert) {
  return client.from("categories").insert(input as never).select("*").single();
}

export async function updateCategory(
  client: AppSupabaseClient,
  restaurantId: string,
  categoryId: string,
  patch: CategoryUpdate
) {
  return client
    .from("categories")
    .update(patch as never)
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .select("*")
    .single();
}

export async function softDeleteCategory(client: AppSupabaseClient, restaurantId: string, categoryId: string) {
  return client
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), is_active: false } as never)
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null);
}
