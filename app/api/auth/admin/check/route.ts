import { NextResponse } from "next/server";

import { getApiAdminContext } from "@/lib/supabase/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") ?? undefined;

  const context = await getApiAdminContext(restaurantId, "staff");
  if (context.error) return context.error;

  return NextResponse.json({
    ok: true,
    userId: context.user.id,
    restaurantId: context.restaurantId,
    role: context.role
  });
}
