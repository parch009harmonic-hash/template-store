"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import { Button } from "@/components/ui/button";
import { getPublicEnv } from "@/lib/env";

type PermissionState = "unsupported" | "default" | "granted" | "denied";

function toUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationCard() {
  const { messages } = useI18n();
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const vapidPublicKey = useMemo(() => getPublicEnv().vapidPublicKey, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PermissionState);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(Boolean(subscription)))
      .catch(() => setSubscribed(false));

    fetch("/api/notifications/status")
      .then((response) => response.json())
      .then((data: { subscribed?: boolean }) => {
        if (typeof data.subscribed === "boolean") {
          setSubscribed(data.subscribed);
        }
      })
      .catch(() => {
        // Ignore status check failure.
      });
  }, []);

  async function handleSubscribe() {
    if (!vapidPublicKey) {
      setMessage(messages.push.missingVapidKey);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const ask = permission === "default" ? await Notification.requestPermission() : permission;
      setPermission(ask as PermissionState);
      if (ask !== "granted") {
        setMessage(messages.push.permissionDenied);
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(vapidPublicKey)
      });

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setMessage(data.error ?? messages.push.cannotSubscribe);
        setLoading(false);
        return;
      }

      setSubscribed(true);
      setMessage(messages.push.enabled);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : messages.push.subscriptionFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setSubscribed(false);
        setLoading(false);
        return;
      }

      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      await subscription.unsubscribe();

      setSubscribed(false);
      setMessage(messages.push.disabled);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : messages.push.unsubscribeFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-2 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-full bg-muted p-2">
          <BellRing className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{messages.push.title}</h2>
          <p className="text-sm text-muted-foreground">{messages.push.description}</p>
        </div>
      </div>

      {permission === "unsupported" ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {messages.push.unsupported}
        </p>
      ) : null}

      {permission === "denied" ? (
        <p className="rounded-md bg-[#fde8e8] px-3 py-2 text-sm text-[#9f1d1d]">
          {messages.push.blocked}
        </p>
      ) : null}

      <div className="flex gap-2">
        {!subscribed ? (
          <Button onClick={handleSubscribe} disabled={loading || permission === "unsupported"}>
            {loading ? messages.push.enabling : messages.push.enableNotifications}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleUnsubscribe} disabled={loading}>
            {loading ? messages.push.updating : messages.push.disableNotifications}
          </Button>
        )}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
