import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import {
  softDeleteLuckyDrawCampaign,
  updateLuckyDrawCampaign
} from "@/lib/supabase/crud/lucky-draw";
import { luckyDrawCampaignUpdateSchema } from "@/lib/validation/lucky-draw";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = luckyDrawCampaignUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const context = await getApiAdminContext(parsed.data.restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await updateLuckyDrawCampaign(context.supabase, context.restaurantId, id, {
    title: parsed.data.title,
    description: parsed.data.description,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    status: parsed.data.status,
    entry_cost_points: parsed.data.entryCostPoints,
    max_entries_per_member: parsed.data.maxEntriesPerMember,
    max_total_entries: parsed.data.maxTotalEntries,
    min_membership_tier: parsed.data.minMembershipTier,
    requires_active_membership: parsed.data.requiresActiveMembership
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  let body: { restaurantId?: string; restaurant_id?: string } = {};
  try {
    body = (await request.json()) as { restaurantId?: string; restaurant_id?: string };
  } catch {
    body = {};
  }
  const restaurantId =
    typeof body?.restaurantId === "string"
      ? body.restaurantId
      : typeof body?.restaurant_id === "string"
        ? body.restaurant_id
        : searchParams.get("restaurantId") ?? undefined;

  const context = await getApiAdminContext(restaurantId, "admin");
  if (context.error) return context.error;

  const { error } = await softDeleteLuckyDrawCampaign(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
