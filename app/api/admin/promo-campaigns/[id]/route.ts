import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import {
  getPromoCampaignById,
  softDeletePromoCampaign,
  updatePromoCampaign
} from "@/lib/supabase/crud/promo-campaigns";
import { promoCampaignUpdateSchema } from "@/lib/validation/promo-campaigns";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return undefined;
}

function normalizePromoUpdatePayload(payload: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  if (typeof payload.restaurantId === "string") normalized.restaurantId = payload.restaurantId;
  else if (typeof payload.restaurant_id === "string") normalized.restaurantId = payload.restaurant_id;

  if (typeof payload.title === "string") normalized.title = payload.title;
  if (typeof payload.description === "string" || payload.description === null) {
    normalized.description = payload.description;
  }

  if (typeof payload.discountType === "string") normalized.discountType = payload.discountType;
  else if (typeof payload.discount_type === "string") normalized.discountType = payload.discount_type;

  if (typeof payload.discountValue === "number") normalized.discountValue = payload.discountValue;
  else if (typeof payload.discount_value === "number") normalized.discountValue = payload.discount_value;
  else if (payload.discountValue !== undefined || payload.discount_value !== undefined) {
    normalized.discountValue = Number(payload.discountValue ?? payload.discount_value);
  }

  if (typeof payload.startsAt === "string") normalized.startsAt = payload.startsAt;
  else if (typeof payload.starts_at === "string") normalized.startsAt = payload.starts_at;

  if (typeof payload.endsAt === "string") normalized.endsAt = payload.endsAt;
  else if (typeof payload.ends_at === "string") normalized.endsAt = payload.ends_at;

  const isActive = toBoolean(payload.isActive ?? payload.is_active);
  if (typeof isActive === "boolean") normalized.isActive = isActive;

  return normalized;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const { data, error } = await getPromoCampaignById(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Promo campaign not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;
  const parsed = promoCampaignUpdateSchema.safeParse(normalizePromoUpdatePayload(payload));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const context = await getApiAdminContext(parsed.data.restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await updatePromoCampaign(context.supabase, context.restaurantId, id, {
    title: parsed.data.title,
    description: parsed.data.description,
    discount_type: parsed.data.discountType,
    discount_value: parsed.data.discountValue,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    is_active: parsed.data.isActive
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  let payload: { restaurantId?: string } = {};
  try {
    payload = (await request.json()) as { restaurantId?: string };
  } catch {
    payload = {};
  }
  const restaurantId =
    typeof payload?.restaurantId === "string" ? payload.restaurantId : searchParams.get("restaurantId") ?? undefined;
  const context = await getApiAdminContext(restaurantId, "admin");
  if (context.error) return context.error;

  const { error } = await softDeletePromoCampaign(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
