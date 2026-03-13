import Link from "next/link";
import { Bell, Gift, History, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { translateMappedLabel } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { getCurrentProfile, requireAuth } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { PushNotificationCard } from "@/components/customer/push-notification-card";
import { SignOutButton } from "@/components/shared/sign-out-button";

type MembershipSnapshot = Pick<
  Database["public"]["Tables"]["memberships"]["Row"],
  "id" | "tier" | "status" | "points" | "restaurant_id"
>;

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  const { messages } = await getServerI18n();

  const supabase = await createServerSupabaseClient();

  let membershipQuery = supabase
    .from("memberships")
    .select("id, tier, status, points, restaurant_id")
    .eq("profile_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (profile?.default_restaurant_id) {
    membershipQuery = membershipQuery.eq("restaurant_id", profile.default_restaurant_id);
  }

  const { data: membershipRowsRaw } = await membershipQuery;
  const membershipRows = (membershipRowsRaw ?? []) as MembershipSnapshot[];
  const membership = membershipRows[0] ?? null;

  let luckyEntryCountQuery = supabase
    .from("lucky_draw_entries")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .is("deleted_at", null);

  if (membership?.restaurant_id) {
    luckyEntryCountQuery = luckyEntryCountQuery.eq("restaurant_id", membership.restaurant_id);
  }

  const { count: luckyDrawEntryCount } = await luckyEntryCountQuery;
  const tierLabel = translateMappedLabel(messages.labels.membershipTier, membership?.tier, messages.labels.guest);
  const statusLabel = translateMappedLabel(
    messages.labels.membershipStatus,
    membership?.status,
    messages.labels.membershipStatus.inactive ?? "inactive"
  );

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-6 w-6" />
          </div>
          <Badge className="capitalize">{tierLabel}</Badge>
        </div>
        <h1 className="mt-3 text-xl font-semibold">
          {profile?.full_name ?? user.email ?? messages.profile.defaultMemberName}
        </h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-sm text-muted-foreground">{profile?.phone ?? "-"}</p>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <article className="rounded-xl border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">{messages.profile.points}</p>
          <p className="text-lg font-semibold">{membership?.points ?? 0}</p>
        </article>
        <article className="rounded-xl border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">{messages.profile.status}</p>
          <p className="text-lg font-semibold capitalize">{statusLabel}</p>
        </article>
        <article className="rounded-xl border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">{messages.profile.entries}</p>
          <p className="text-lg font-semibold">{luckyDrawEntryCount ?? 0}</p>
        </article>
      </section>

      <section className="space-y-2 rounded-2xl border bg-card p-4 shadow-sm">
        <Link
          href="/lucky-draw"
          className="inline-flex w-full items-center gap-2 rounded-lg bg-muted p-3 text-sm font-medium"
        >
          <Gift className="h-4 w-4" />
          {messages.profile.goToLuckyDraw}
        </Link>
        <Link
          href="/lucky-draw/history"
          className="inline-flex w-full items-center gap-2 rounded-lg bg-muted p-3 text-sm font-medium"
        >
          <History className="h-4 w-4" />
          {messages.profile.luckyDrawHistory}
        </Link>
        <button className="inline-flex w-full items-center gap-2 rounded-lg bg-muted p-3 text-left text-sm font-medium">
          <Bell className="h-4 w-4" />
          {messages.profile.notificationPreferences}
        </button>
        <SignOutButton />
      </section>

      <PushNotificationCard />
    </div>
  );
}
