import { NextResponse } from "next/server";
import webpush from "web-push";

import { getPublicEnv, getWebPushEnv } from "@/lib/env";
import { getRequestId, logger } from "@/lib/logger";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getApiAdminContext } from "@/lib/supabase/api";
import type { Database } from "@/lib/supabase/database.types";

interface BroadcastPayload {
  restaurantId?: string;
  title: string;
  message: string;
  url?: string;
  targetScope?: string;
}

export const runtime = "nodejs";

type PushSubscriptionRow = Pick<
  Database["public"]["Tables"]["push_subscriptions"]["Row"],
  "id" | "profile_id" | "endpoint" | "p256dh" | "auth"
>;
type NotificationBroadcastRow = Database["public"]["Tables"]["notification_broadcasts"]["Row"];
type NotificationDispatchInsert = Database["public"]["Tables"]["notification_dispatch_logs"]["Insert"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const body = (await request.json()) as BroadcastPayload;
  if (!body.title || !body.message) {
    logger.warn("notifications.broadcast.invalid_payload", { requestId });
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const adminContext = await getApiAdminContext(body.restaurantId, "admin");
  if (adminContext.error || !adminContext.user) {
    logger.warn("notifications.broadcast.unauthorized", { requestId });
    return adminContext.error;
  }

  const vapidPublicKey = getPublicEnv().vapidPublicKey;
  const { vapidPrivateKey, vapidSubject } = getWebPushEnv();
  if (!vapidPublicKey) {
    logger.error("notifications.broadcast.missing_vapid_public_key", { requestId });
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY" }, { status: 500 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const adminClient = createAdminSupabaseClient();

  const { data: subscriptions, error: subsError } = await adminClient
    .from("push_subscriptions")
    .select("id, profile_id, endpoint, p256dh, auth")
    .eq("restaurant_id", adminContext.restaurantId)
    .eq("is_active", true);

  if (subsError) {
    logger.error("notifications.broadcast.subscription_query_failed", {
      requestId,
      error: subsError.message
    });
    return NextResponse.json({ error: subsError.message }, { status: 400 });
  }

  const { data: broadcastRaw, error: broadcastError } = await adminClient
    .from("notification_broadcasts")
    .insert({
      restaurant_id: adminContext.restaurantId,
      sent_by_profile_id: adminContext.user.id,
      title: body.title,
      message: body.message,
      payload: { url: body.url ?? "/promotions" },
      target_scope: body.targetScope ?? "members",
      total_subscribers: subscriptions?.length ?? 0
    })
    .select("*")
    .single();
  const broadcast = (broadcastRaw ?? null) as NotificationBroadcastRow | null;

  if (broadcastError || !broadcast) {
    logger.error("notifications.broadcast.create_failed", {
      requestId,
      error: broadcastError?.message ?? "Cannot create broadcast"
    });
    return NextResponse.json({ error: broadcastError?.message ?? "Cannot create broadcast" }, { status: 400 });
  }

  const subscriptionRows = (subscriptions ?? []) as PushSubscriptionRow[];

  const dispatchLogs: NotificationDispatchInsert[] = [];

  let successCount = 0;
  let failCount = 0;
  const expiredSubscriptionIds: string[] = [];

  for (const sub of subscriptionRows) {
    const payload = JSON.stringify({
      title: body.title,
      body: body.message,
      url: body.url ?? "/promotions"
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        payload
      );

      successCount += 1;
      dispatchLogs.push({
        broadcast_id: broadcast.id,
        subscription_id: sub.id,
        profile_id: sub.profile_id,
        status: "sent"
      });
    } catch (error) {
      failCount += 1;
      const errorMessage = error instanceof Error ? error.message : "Unknown push error";
      dispatchLogs.push({
        broadcast_id: broadcast.id,
        subscription_id: sub.id,
        profile_id: sub.profile_id,
        status: "failed",
        error_message: errorMessage
      });

      if (errorMessage.includes("410") || errorMessage.includes("404")) {
        expiredSubscriptionIds.push(sub.id);
      }
    }
  }

  if (dispatchLogs.length > 0) {
    await adminClient.from("notification_dispatch_logs").insert(dispatchLogs);
  }

  if (expiredSubscriptionIds.length > 0) {
    await adminClient
      .from("push_subscriptions")
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .in("id", expiredSubscriptionIds);
  }

  const uniqueProfileIds = Array.from(
    new Set(subscriptionRows.map((item) => item.profile_id).filter((item): item is string => Boolean(item)))
  );

  if (uniqueProfileIds.length > 0) {
    const notifications: NotificationInsert[] = uniqueProfileIds.map((profileId) => ({
      restaurant_id: adminContext.restaurantId,
      profile_id: profileId,
      type: "promo",
      title: body.title,
      message: body.message,
      payload: { url: body.url ?? "/promotions", broadcast_id: broadcast.id },
      created_by: adminContext.user.id
    }));

    await adminClient.from("notifications").insert(notifications);
  }

  await adminClient
    .from("notification_broadcasts")
    .update({
      total_sent: successCount,
      total_failed: failCount
    })
    .eq("id", broadcast.id);

  logger.info("notifications.broadcast.completed", {
    requestId,
    restaurantId: adminContext.restaurantId,
    broadcastId: broadcast.id,
    totalSubscribers: subscriptions?.length ?? 0,
    sent: successCount,
    failed: failCount
  });

  return NextResponse.json({
    ok: true,
    broadcastId: broadcast.id,
    totalSubscribers: subscriptions?.length ?? 0,
    sent: successCount,
    failed: failCount
  });
}
