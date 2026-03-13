import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import { createPromoCampaign } from "@/lib/supabase/crud/promo-campaigns";
import { promoCampaignCreateSchema } from "@/lib/validation/promo-campaigns";

function toBoolean(value: unknown, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return defaultValue;
}

function normalizePromoPayload(payload: Record<string, unknown>) {
  return {
    restaurantId:
      typeof payload.restaurantId === "string"
        ? payload.restaurantId
        : typeof payload.restaurant_id === "string"
          ? payload.restaurant_id
          : undefined,
    title: typeof payload.title === "string" ? payload.title : "",
    description:
      typeof payload.description === "string"
        ? payload.description
        : payload.description === null
          ? null
          : undefined,
    discountType:
      typeof payload.discountType === "string"
        ? payload.discountType
        : typeof payload.discount_type === "string"
          ? payload.discount_type
          : undefined,
    discountValue:
      typeof payload.discountValue === "number"
        ? payload.discountValue
        : typeof payload.discount_value === "number"
          ? payload.discount_value
          : Number(payload.discountValue ?? payload.discount_value ?? 0),
    startsAt:
      typeof payload.startsAt === "string"
        ? payload.startsAt
        : typeof payload.starts_at === "string"
          ? payload.starts_at
          : undefined,
    endsAt:
      typeof payload.endsAt === "string"
        ? payload.endsAt
        : typeof payload.ends_at === "string"
          ? payload.ends_at
          : undefined,
    isActive: toBoolean(payload.isActive ?? payload.is_active, false)
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));
  const sortByRaw = searchParams.get("sortBy") ?? "starts_at";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const query = searchParams.get("query")?.trim() ?? "";
  const filterKey = searchParams.get("filterKey");
  const filterValue = searchParams.get("filterValue");

  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const sortableColumns = new Set([
    "title",
    "discount_type",
    "discount_value",
    "starts_at",
    "ends_at",
    "created_at",
    "updated_at",
    "is_active"
  ]);
  const sortBy = sortableColumns.has(sortByRaw) ? sortByRaw : "starts_at";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let queryBuilder = context.supabase
    .from("promo_campaigns")
    .select("*", { count: "exact" })
    .eq("restaurant_id", context.restaurantId)
    .is("deleted_at", null);

  if (query.length > 0) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  if (filterKey === "is_active" && (filterValue === "true" || filterValue === "false")) {
    queryBuilder = queryBuilder.eq("is_active", filterValue === "true");
  } else if (
    filterKey === "discount_type" &&
    (filterValue === "percentage" || filterValue === "fixed_amount" || filterValue === "free_item")
  ) {
    queryBuilder = queryBuilder.eq("discount_type", filterValue);
  }

  const { data, error, count } = await queryBuilder
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    pageSize
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;
  const parsed = promoCampaignCreateSchema.safeParse(normalizePromoPayload(payload));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const context = await getApiAdminContext(parsed.data.restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await createPromoCampaign(context.supabase, {
    restaurant_id: context.restaurantId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    discount_type: parsed.data.discountType,
    discount_value: parsed.data.discountValue,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    is_active: parsed.data.isActive
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
