import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import {
  createLuckyDrawCampaign,
  listLuckyDrawCampaigns
} from "@/lib/supabase/crud/lucky-draw";
import { luckyDrawCampaignCreateSchema } from "@/lib/validation/lucky-draw";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;

  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const { data, error } = await listLuckyDrawCampaigns(context.supabase, context.restaurantId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = luckyDrawCampaignCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const context = await getApiAdminContext(parsed.data.restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await createLuckyDrawCampaign(context.supabase, {
    restaurant_id: context.restaurantId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    status: parsed.data.status,
    entry_cost_points: parsed.data.entryCostPoints,
    max_entries_per_member: parsed.data.maxEntriesPerMember,
    max_total_entries: parsed.data.maxTotalEntries ?? null,
    min_membership_tier: parsed.data.minMembershipTier,
    requires_active_membership: parsed.data.requiresActiveMembership,
    created_by: context.user.id
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
