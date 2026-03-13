import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/supabase/api";
import { listActiveLuckyDrawCampaigns } from "@/lib/supabase/crud/lucky-draw";
import type { Database } from "@/lib/supabase/database.types";

type LuckyDrawCampaignRow = Database["public"]["Tables"]["lucky_draw_campaigns"]["Row"];
type MembershipRow = Pick<
  Database["public"]["Tables"]["memberships"]["Row"],
  "id" | "tier" | "status" | "points" | "restaurant_id"
>;

const membershipTierRank = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4
} as const;

async function resolveRestaurantId(
  profileId: string,
  requestedRestaurantId: string | null,
  supabase: Awaited<ReturnType<typeof getApiUser>>["supabase"]
) {
  if (requestedRestaurantId) return requestedRestaurantId;

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("default_restaurant_id")
    .eq("id", profileId)
    .single();
  const profile = (profileRaw ?? null) as { default_restaurant_id: string | null } | null;

  if (profile?.default_restaurant_id) {
    return profile.default_restaurant_id;
  }

  const { data: membershipsRaw } = await supabase
    .from("memberships")
    .select("restaurant_id")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const memberships = (membershipsRaw ?? []) as Array<{ restaurant_id: string }>;

  return memberships?.[0]?.restaurant_id ?? null;
}

function resolveCampaignEligibility(
  campaign: LuckyDrawCampaignRow,
  membership: MembershipRow | null,
  existingEntries: number
) {
  const now = Date.now();
  const startTime = new Date(campaign.starts_at).getTime();
  const endTime = new Date(campaign.ends_at).getTime();
  const windowActive = now >= startTime && now <= endTime;
  const totalQuotaReached =
    campaign.max_total_entries !== null && campaign.total_entries >= campaign.max_total_entries;

  if (campaign.status !== "active") {
    return {
      isEligible: false,
      reason: "Campaign is inactive"
    };
  }

  if (!windowActive) {
    return {
      isEligible: false,
      reason: "Campaign is out of active period"
    };
  }

  if (totalQuotaReached) {
    return {
      isEligible: false,
      reason: "Campaign quota is full"
    };
  }

  if (existingEntries >= campaign.max_entries_per_member) {
    return {
      isEligible: false,
      reason: "Entry limit reached for your account"
    };
  }

  if (campaign.requires_active_membership && !membership) {
    return {
      isEligible: false,
      reason: "Active membership is required"
    };
  }

  if (membership && membership.status !== "active" && campaign.requires_active_membership) {
    return {
      isEligible: false,
      reason: "Membership is not active"
    };
  }

  if (membership) {
    if (membershipTierRank[membership.tier] < membershipTierRank[campaign.min_membership_tier]) {
      return {
        isEligible: false,
        reason: "Membership tier does not meet requirement"
      };
    }

    if (campaign.entry_cost_points > 0 && membership.points < campaign.entry_cost_points) {
      return {
        isEligible: false,
        reason: "Not enough points"
      };
    }
  } else if (campaign.entry_cost_points > 0) {
    return {
      isEligible: false,
      reason: "Membership points are required"
    };
  }

  return {
    isEligible: true,
    reason: null
  };
}

export async function GET(request: Request) {
  const auth = await getApiUser();
  if (auth.error || !auth.user) return auth.error;

  const { searchParams } = new URL(request.url);
  const restaurantId = await resolveRestaurantId(
    auth.user.id,
    searchParams.get("restaurantId"),
    auth.supabase
  );

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant context is required" }, { status: 400 });
  }

  const { data, error } = await listActiveLuckyDrawCampaigns(auth.supabase, restaurantId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const campaigns = (data ?? []) as LuckyDrawCampaignRow[];

  const { data: membershipRowsRaw, error: membershipError } = await auth.supabase
    .from("memberships")
    .select("id, tier, status, points, restaurant_id")
    .eq("profile_id", auth.user.id)
    .eq("restaurant_id", restaurantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 400 });
  }

  const membershipRows = (membershipRowsRaw ?? []) as MembershipRow[];
  const membership = (membershipRows?.[0] ?? null) as MembershipRow | null;

  const entryCountMap = new Map<string, number>();
  const campaignIds = campaigns.map((campaign) => campaign.id);

  if (campaignIds.length > 0) {
    const { data: entriesRaw, error: entryError } = await auth.supabase
      .from("lucky_draw_entries")
      .select("lucky_draw_campaign_id")
      .eq("profile_id", auth.user.id)
      .eq("restaurant_id", restaurantId)
      .is("deleted_at", null)
      .in("lucky_draw_campaign_id", campaignIds);

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 400 });
    }

    const entries = (entriesRaw ?? []) as Array<{ lucky_draw_campaign_id: string | null }>;

    for (const entry of entries ?? []) {
      const campaignId = entry.lucky_draw_campaign_id;
      if (!campaignId) continue;
      entryCountMap.set(campaignId, (entryCountMap.get(campaignId) ?? 0) + 1);
    }
  }

  const enrichedCampaigns = campaigns.map((campaign) => {
    const existingEntries = entryCountMap.get(campaign.id) ?? 0;
    const eligibility = resolveCampaignEligibility(campaign, membership, existingEntries);

    return {
      ...campaign,
      existingEntries,
      remainingEntries: Math.max(campaign.max_entries_per_member - existingEntries, 0),
      isEligible: eligibility.isEligible,
      eligibilityReason: eligibility.reason
    };
  });

  return NextResponse.json({
    restaurantId,
    membership: membership
      ? {
          id: membership.id,
          tier: membership.tier,
          status: membership.status,
          points: membership.points
        }
      : null,
    data: enrichedCampaigns
  });
}
