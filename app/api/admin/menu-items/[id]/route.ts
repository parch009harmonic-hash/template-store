import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import { getMenuItemById, softDeleteMenuItem, updateMenuItem } from "@/lib/supabase/crud/menu-items";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const { data, error } = await getMenuItemById(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const payload = await request.json();
  const restaurantId =
    typeof payload?.restaurant_id === "string"
      ? payload.restaurant_id
      : typeof payload?.restaurantId === "string"
        ? payload.restaurantId
        : undefined;
  const context = await getApiAdminContext(restaurantId, "admin");
  if (context.error) return context.error;

  const { data, error } = await updateMenuItem(context.supabase, context.restaurantId, id, {
    category_id: payload.category_id,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    image_url: payload.image_url,
    sku: payload.sku,
    sort_order: payload.sort_order,
    is_available: payload.is_available
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  let payload: { restaurant_id?: string } = {};
  try {
    payload = (await request.json()) as { restaurant_id?: string };
  } catch {
    payload = {};
  }

  const restaurantId = typeof payload.restaurant_id === "string" ? payload.restaurant_id : searchParams.get("restaurantId") ?? undefined;
  const context = await getApiAdminContext(restaurantId, "admin");
  if (context.error) return context.error;

  const { error } = await softDeleteMenuItem(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
