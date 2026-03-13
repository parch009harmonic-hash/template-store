"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Gift, Ticket } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateLocale, translateMappedLabel } from "@/lib/i18n";
import { luckyDrawCampaigns, memberProfile } from "@/lib/mock/customer";

interface MembershipSnapshot {
  id: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  status: "active" | "inactive" | "blocked";
  points: number;
}

interface LuckyDrawCampaignView {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  status: "active" | "inactive";
  entry_cost_points: number;
  max_entries_per_member: number;
  min_membership_tier: "bronze" | "silver" | "gold" | "platinum";
  existingEntries: number;
  remainingEntries: number;
  isEligible: boolean;
  eligibilityReason: string | null;
}

interface LuckyDrawCampaignResponse {
  restaurantId: string;
  membership: MembershipSnapshot | null;
  data: LuckyDrawCampaignView[];
}

function formatLocalDateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

type DataMode = "mock" | "live";

interface LuckyDrawCampaignListProps {
  mode?: DataMode;
}

const tierRank: Record<MembershipSnapshot["tier"], number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4
};

function getMockMembership(): MembershipSnapshot {
  const tierValue = memberProfile.tier.toLowerCase();
  const normalizedTier: MembershipSnapshot["tier"] =
    tierValue === "bronze" || tierValue === "silver" || tierValue === "gold" || tierValue === "platinum"
      ? tierValue
      : "gold";

  return {
    id: "mock-membership",
    tier: normalizedTier,
    status: "active",
    points: memberProfile.points
  };
}

export function LuckyDrawCampaignList({ mode = "mock" }: LuckyDrawCampaignListProps) {
  const { locale, messages } = useI18n();
  const [loading, setLoading] = useState(true);
  const [joiningCampaignId, setJoiningCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<LuckyDrawCampaignView[]>([]);
  const [membership, setMembership] = useState<MembershipSnapshot | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);

  const activeCampaignCount = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active").length,
    [campaigns]
  );

  const totalJoinedEntries = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.existingEntries, 0),
    [campaigns]
  );

  const loadCampaigns = useCallback(async () => {
    setLoading(true);

    if (mode === "mock") {
      const mockMembership = getMockMembership();
      const mapped = luckyDrawCampaigns.map((campaign) => {
        const remainingEntries = Math.max(campaign.maxEntriesPerMember - campaign.existingEntries, 0);
        const isTierEligible = tierRank[mockMembership.tier] >= tierRank[campaign.minMembershipTier];
        const isPointEligible = mockMembership.points >= campaign.entryCostPoints;
        const isQuotaEligible = remainingEntries > 0;
        const isStatusEligible = campaign.status === "active";
        const isEligible = isTierEligible && isPointEligible && isQuotaEligible && isStatusEligible;

        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          starts_at: campaign.startsAt,
          ends_at: campaign.endsAt,
          status: campaign.status,
          entry_cost_points: campaign.entryCostPoints,
          max_entries_per_member: campaign.maxEntriesPerMember,
          min_membership_tier: campaign.minMembershipTier,
          existingEntries: campaign.existingEntries,
          remainingEntries,
          isEligible,
          eligibilityReason: isEligible ? null : messages.luckyCampaign.locked
        } satisfies LuckyDrawCampaignView;
      });

      setCampaigns(mapped);
      setMembership(mockMembership);
      setStatusError(false);
      setStatusMessage(null);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/lucky-draw/campaigns", { cache: "no-store" });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setStatusError(true);
      setStatusMessage(payload.error ?? messages.luckyCampaign.unableToLoadCampaigns);
      const fallbackMembership = getMockMembership();
      setMembership(fallbackMembership);
      setCampaigns(
        luckyDrawCampaigns.map((campaign) => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          starts_at: campaign.startsAt,
          ends_at: campaign.endsAt,
          status: campaign.status,
          entry_cost_points: campaign.entryCostPoints,
          max_entries_per_member: campaign.maxEntriesPerMember,
          min_membership_tier: campaign.minMembershipTier,
          existingEntries: campaign.existingEntries,
          remainingEntries: Math.max(campaign.maxEntriesPerMember - campaign.existingEntries, 0),
          isEligible: true,
          eligibilityReason: null
        }))
      );
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as LuckyDrawCampaignResponse;
    setCampaigns(payload.data ?? []);
    setMembership(payload.membership ?? null);
    setStatusError(false);
    setStatusMessage(null);
    setLoading(false);
  }, [messages.luckyCampaign.locked, messages.luckyCampaign.unableToLoadCampaigns, mode]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function handleJoinCampaign(campaignId: string) {
    if (mode === "mock") {
      setJoiningCampaignId(campaignId);
      setStatusMessage(null);
      setStatusError(false);

      const target = campaigns.find((campaign) => campaign.id === campaignId);
      if (!target || !target.isEligible) {
        setStatusError(true);
        setStatusMessage(messages.luckyCampaign.unableToJoin);
        setJoiningCampaignId(null);
        return;
      }

      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (campaign.id !== campaignId) return campaign;
          const existingEntries = campaign.existingEntries + 1;
          const remainingEntries = Math.max(campaign.max_entries_per_member - existingEntries, 0);
          return {
            ...campaign,
            existingEntries,
            remainingEntries,
            isEligible: remainingEntries > 0
          };
        })
      );
      setMembership((prev) =>
        prev
          ? {
              ...prev,
              points: Math.max(prev.points - target.entry_cost_points, 0)
            }
          : prev
      );
      setStatusMessage(messages.luckyCampaign.joinedSuccessfully);
      setStatusError(false);
      setJoiningCampaignId(null);
      return;
    }

    setJoiningCampaignId(campaignId);
    setStatusMessage(null);
    setStatusError(false);

    const response = await fetch("/api/lucky-draw/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatusError(true);
      setStatusMessage(payload.error ?? messages.luckyCampaign.unableToJoin);
      setJoiningCampaignId(null);
      await loadCampaigns();
      return;
    }

    setStatusError(false);
    setStatusMessage(messages.luckyCampaign.joinedSuccessfully);
    setJoiningCampaignId(null);
    await loadCampaigns();
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border bg-gradient-to-br from-[#254138] via-[#2d5c4a] to-[#4d936f] p-4 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.14em] text-[#d1f2e2]">{messages.luckyCampaign.heroLabel}</p>
        <h1 className="mt-1 text-2xl font-semibold">{messages.luckyCampaign.heroTitle}</h1>
        <p className="text-sm text-[#d1f2e2]">{messages.luckyCampaign.heroDescription}</p>
        <Link
          href="/lucky-draw/history"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm"
        >
          <Ticket className="h-4 w-4" />
          {messages.luckyCampaign.viewHistory}
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-2">
        <article className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{messages.luckyCampaign.membershipTier}</p>
          <p className="text-xl font-semibold capitalize">
            {translateMappedLabel(messages.labels.membershipTier, membership?.tier, messages.labels.guest)}
          </p>
        </article>
        <article className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{messages.luckyCampaign.availablePoints}</p>
          <p className="text-xl font-semibold">{membership?.points ?? 0}</p>
        </article>
        <article className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{messages.luckyCampaign.activeCampaigns}</p>
          <p className="text-xl font-semibold">{activeCampaignCount}</p>
        </article>
        <article className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{messages.luckyCampaign.myEntries}</p>
          <p className="text-xl font-semibold">{totalJoinedEntries}</p>
        </article>
      </section>

      {statusMessage ? (
        <p className={statusError ? "text-sm text-red-600" : "text-sm text-[#2b8f68]"}>{statusMessage}</p>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">{messages.luckyCampaign.loading}</p> : null}

      {!loading && campaigns.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{messages.luckyCampaign.noCampaignTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{messages.luckyCampaign.noCampaignDescription}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{campaign.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.description ?? messages.luckyCampaign.defaultDescription}
                  </p>
                </div>
                <Badge variant={campaign.isEligible ? "default" : "outline"}>
                  {campaign.isEligible ? messages.luckyCampaign.eligible : messages.luckyCampaign.locked}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyCampaign.costPerEntry}</p>
                  <p className="font-semibold">
                    {campaign.entry_cost_points} {messages.luckyCampaign.pointsUnit}
                  </p>
                </article>
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyCampaign.minTier}</p>
                  <p className="font-semibold capitalize">
                    {translateMappedLabel(
                      messages.labels.membershipTier,
                      campaign.min_membership_tier,
                      campaign.min_membership_tier
                    )}
                  </p>
                </article>
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyCampaign.yourEntries}</p>
                  <p className="font-semibold">
                    {campaign.existingEntries} / {campaign.max_entries_per_member}
                  </p>
                </article>
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyCampaign.remainingRights}</p>
                  <p className="font-semibold">{campaign.remainingEntries}</p>
                </article>
              </div>

              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatLocalDateTime(campaign.starts_at, getDateLocale(locale))} -{" "}
                {formatLocalDateTime(campaign.ends_at, getDateLocale(locale))}
              </p>

              {!campaign.isEligible && campaign.eligibilityReason ? (
                <p className="text-xs text-muted-foreground">{campaign.eligibilityReason}</p>
              ) : null}

              <Button
                className="w-full gap-2 bg-[#2f7d5d] hover:bg-[#286a50]"
                disabled={!campaign.isEligible || joiningCampaignId === campaign.id}
                onClick={() => handleJoinCampaign(campaign.id)}
              >
                <Gift className="h-4 w-4" />
                {joiningCampaignId === campaign.id
                  ? messages.luckyCampaign.joining
                  : messages.luckyCampaign.joinLuckyDraw}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
