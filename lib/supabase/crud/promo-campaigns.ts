import type {
  AppSupabaseClient,
  TableInsert,
  TableRow,
  TableUpdate
} from "@/lib/supabase/types";

export type PromoCampaignRow = TableRow<"promo_campaigns">;
export type PromoCampaignInsert = TableInsert<"promo_campaigns">;
export type PromoCampaignUpdate = TableUpdate<"promo_campaigns">;

export async function listPromoCampaigns(client: AppSupabaseClient, restaurantId: string) {
  return client
    .from("promo_campaigns")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .order("starts_at", { ascending: false });
}

export async function getPromoCampaignById(
  client: AppSupabaseClient,
  restaurantId: string,
  campaignId: string
) {
  return client
    .from("promo_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function createPromoCampaign(client: AppSupabaseClient, input: PromoCampaignInsert) {
  return client.from("promo_campaigns").insert(input as never).select("*").single();
}

export async function updatePromoCampaign(
  client: AppSupabaseClient,
  restaurantId: string,
  campaignId: string,
  patch: PromoCampaignUpdate
) {
  return client
    .from("promo_campaigns")
    .update(patch as never)
    .eq("id", campaignId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .select("*")
    .single();
}

export async function softDeletePromoCampaign(
  client: AppSupabaseClient,
  restaurantId: string,
  campaignId: string
) {
  return client
    .from("promo_campaigns")
    .update({ deleted_at: new Date().toISOString(), is_active: false } as never)
    .eq("id", campaignId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null);
}
