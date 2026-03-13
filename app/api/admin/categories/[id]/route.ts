import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";
import { getCategoryById, softDeleteCategory, updateCategory } from "@/lib/supabase/crud/categories";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const { data, error } = await getCategoryById(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Category not found" }, { status: 404 });

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

  const { data, error } = await updateCategory(context.supabase, context.restaurantId, id, {
    name: payload.name,
    description: payload.description,
    sort_order: payload.sort_order,
    is_active: payload.is_active
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

  const { error } = await softDeleteCategory(context.supabase, context.restaurantId, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
