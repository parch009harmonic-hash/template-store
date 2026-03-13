import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/supabase/api";
import { listLuckyDrawHistory } from "@/lib/supabase/crud/lucky-draw";

export async function GET(request: Request) {
  try {
    const auth = await getApiUser();
    if (auth.error || !auth.user) return auth.error;

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId") ?? undefined;

    const { data, error } = await listLuckyDrawHistory(auth.supabase, auth.user.id, restaurantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unable to load lucky draw history" }, { status: 500 });
  }
}
