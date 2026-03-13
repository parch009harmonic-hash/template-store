import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/supabase/api";

interface WebPushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: Request) {
  const auth = await getApiUser();
  if (auth.error || !auth.user) return auth.error;

  const body = await request.json();
  const subscription = body.subscription as WebPushSubscriptionPayload | undefined;
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
  }

  const requestedRestaurantId = (body.restaurantId as string | undefined) ?? null;

  let restaurantId = requestedRestaurantId;
  if (!restaurantId) {
    const { data: profileRaw } = await auth.supabase
      .from("profiles")
      .select("default_restaurant_id")
      .eq("id", auth.user.id)
      .single();
    const profile = (profileRaw ?? null) as { default_restaurant_id: string | null } | null;
    restaurantId = profile?.default_restaurant_id ?? null;
  }

  const { error } = await auth.supabase.from("push_subscriptions").upsert(
    {
      profile_id: auth.user.id,
      restaurant_id: restaurantId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: request.headers.get("user-agent"),
      is_active: true,
      deactivated_at: null
    } as never,
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
