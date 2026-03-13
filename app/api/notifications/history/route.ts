import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getApiAdminContext } from "@/lib/supabase/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const query = searchParams.get("query")?.trim() ?? "";
  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  const adminClient = createAdminSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let queryBuilder = adminClient
    .from("notification_broadcasts")
    .select("*", { count: "exact" })
    .eq("restaurant_id", context.restaurantId)
    .order("created_at", { ascending: sortOrder === "asc" });

  if (query.length > 0) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,message.ilike.%${query}%`);
  }

  const { data, error, count } = await queryBuilder.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    pageSize
  });
}
