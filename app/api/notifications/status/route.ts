import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/supabase/api";

export async function GET() {
  const auth = await getApiUser();
  if (auth.error || !auth.user) return auth.error;

  const { data, error } = await auth.supabase
    .from("push_subscriptions")
    .select("id")
    .eq("profile_id", auth.user.id)
    .eq("is_active", true)
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ subscribed: Boolean(data?.length) });
}

