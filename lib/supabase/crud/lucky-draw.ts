import type {
  AppSupabaseClient,
  TableInsert,
  TableRow,
  TableUpdate
} from "@/lib/supabase/types";

export type LuckyDrawCampaignRow = TableRow<"lucky_draw_campaigns">;
export type LuckyDrawCampaignInsert = TableInsert<"lucky_draw_campaigns">;
export type LuckyDrawCampaignUpdate = TableUpdate<"lucky_draw_campaigns">;

export async function listLuckyDrawCampaigns(client: AppSupabaseClient, restaurantId: string) {
  return client
    .from("lucky_draw_campaigns")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .order("starts_at", { ascending: false });
}

export async function listActiveLuckyDrawCampaigns(client: AppSupabaseClient, restaurantId: string) {
  const nowIso = new Date().toISOString();
  return client
    .from("lucky_draw_campaigns")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso)
    .is("deleted_at", null)
    .order("starts_at", { ascending: false });
}

export async function createLuckyDrawCampaign(
  client: AppSupabaseClient,
  input: LuckyDrawCampaignInsert
) {
  return client.from("lucky_draw_campaigns").insert(input as never).select("*").single();
}

export async function updateLuckyDrawCampaign(
  client: AppSupabaseClient,
  restaurantId: string,
  campaignId: string,
  patch: LuckyDrawCampaignUpdate
) {
  return client
    .from("lucky_draw_campaigns")
    .update(patch as never)
    .eq("id", campaignId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .select("*")
    .single();
}

export async function softDeleteLuckyDrawCampaign(
  client: AppSupabaseClient,
  restaurantId: string,
  campaignId: string
) {
  return client
    .from("lucky_draw_campaigns")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" } as never)
    .eq("id", campaignId)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null);
}

export async function joinLuckyDrawCampaign(
  client: AppSupabaseClient,
  profileId: string,
  campaignId: string
) {
  return client
    .from("lucky_draw_entries")
    .insert(
      {
        profile_id: profileId,
        lucky_draw_campaign_id: campaignId
      } as never
    )
    .select("*")
    .single();
}

export async function listLuckyDrawHistory(
  client: AppSupabaseClient,
  profileId: string,
  restaurantId?: string
) {
  let query = client
    .from("lucky_draw_entries")
    .select(
      "id, restaurant_id, lucky_draw_campaign_id, points_spent, draw_date, status, won_prize, created_at, lucky_draw_campaigns(id, title, starts_at, ends_at, status)"
    )
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId);
  }

  return query;
}
