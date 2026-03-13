import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import { createMenuItem } from "@/lib/supabase/crud/menu-items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));
  const sortByRaw = searchParams.get("sortBy") ?? "sort_order";
  const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
  const query = searchParams.get("query")?.trim() ?? "";
  const filterKey = searchParams.get("filterKey");
  const filterValue = searchParams.get("filterValue");

  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const sortableColumns = new Set([
    "name",
    "category_id",
    "price",
    "sku",
    "sort_order",
    "created_at",
    "updated_at",
    "is_available"
  ]);
  const sortBy = sortableColumns.has(sortByRaw) ? sortByRaw : "sort_order";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let queryBuilder = context.supabase
    .from("menu_items")
    .select("*", { count: "exact" })
    .eq("restaurant_id", context.restaurantId)
    .is("deleted_at", null);

  if (query.length > 0) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`);
  }

  if (filterKey === "is_available" && (filterValue === "true" || filterValue === "false")) {
    queryBuilder = queryBuilder.eq("is_available", filterValue === "true");
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
  const payload = await request.json();
  const restaurantId =
    typeof payload?.restaurant_id === "string"
      ? payload.restaurant_id
      : typeof payload?.restaurantId === "string"
        ? payload.restaurantId
        : undefined;
  const context = await getApiAdminContext(restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await createMenuItem(context.supabase, {
    restaurant_id: context.restaurantId,
    category_id: payload.category_id ?? null,
    name: payload.name,
    description: payload.description ?? null,
    price: payload.price,
    image_url: payload.image_url ?? null,
    sku: payload.sku ?? null,
    sort_order: payload.sort_order ?? 0,
    is_available: payload.is_available ?? true
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
