import type {
  AppSupabaseClient,
  TableInsert,
  TableRow,
  TableUpdate
} from "@/lib/supabase/types";

export type MenuItemRow = TableRow<"menu_items">;
export type MenuItemInsert = TableInsert<"menu_items">;
export type MenuItemUpdate = TableUpdate<"menu_items">;

export async function listMenuItems(client: AppSupabaseClient, restaurantId: string) {
  return client
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
}

export async function getMenuItemById(client: AppSupabaseClient, restaurantId: string, itemId: string) {
  return client
    .from("menu_items")
    .select("*")
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function createMenuItem(client: AppSupabaseClient, input: MenuItemInsert) {
  return client.from("menu_items").insert(input as never).select("*").single();
}

export async function updateMenuItem(
  client: AppSupabaseClient,
  restaurantId: string,
  itemId: string,
  patch: MenuItemUpdate
) {
  return client
    .from("menu_items")
    .update(patch as never)
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .select("*")
    .single();
}

export async function softDeleteMenuItem(client: AppSupabaseClient, restaurantId: string, itemId: string) {
  return client
    .from("menu_items")
    .update({ deleted_at: new Date().toISOString(), is_available: false } as never)
    .eq("id", itemId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null);
}
