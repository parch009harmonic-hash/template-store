import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/supabase/api";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if (auth.error || !auth.user) return auth.error;

  const body = await request.json();
  const endpoint = body.endpoint as string | undefined;
  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("push_subscriptions")
    .update(
      {
        is_active: false,
        deactivated_at: new Date().toISOString()
      } as never
    )
    .eq("profile_id", auth.user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
