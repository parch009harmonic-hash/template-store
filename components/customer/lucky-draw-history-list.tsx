"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Ticket } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateLocale, translateMappedLabel } from "@/lib/i18n";
import { luckyDrawHistory } from "@/lib/mock/customer";

interface LuckyDrawCampaignInfo {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
}

interface LuckyDrawHistoryRow {
  id: string;
  status: "pending" | "won" | "lost" | "claimed";
  points_spent: number;
  won_prize: string | null;
  created_at: string;
  lucky_draw_campaigns?: LuckyDrawCampaignInfo | LuckyDrawCampaignInfo[] | null;
}

function resolveCampaignTitle(campaign: LuckyDrawHistoryRow["lucky_draw_campaigns"], fallback: string) {
  if (!campaign) return fallback;
  if (Array.isArray(campaign)) return campaign[0]?.title ?? fallback;
  return campaign.title;
}

type DataMode = "mock" | "live";

interface LuckyDrawHistoryListProps {
  mode?: DataMode;
}

function mapMockHistory(): LuckyDrawHistoryRow[] {
  return luckyDrawHistory.map((item) => ({
    id: item.id,
    status: item.status,
    points_spent: item.pointsSpent,
    won_prize: item.wonPrize,
    created_at: item.createdAt,
    lucky_draw_campaigns: {
      id: `mock-${item.id}`,
      title: item.campaignTitle,
      starts_at: item.createdAt,
      ends_at: item.createdAt
    }
  }));
}

export function LuckyDrawHistoryList({ mode = "mock" }: LuckyDrawHistoryListProps) {
  const { locale, messages } = useI18n();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<LuckyDrawHistoryRow[]>([]);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);

      if (mode === "mock") {
        setHistoryRows(mapMockHistory());
        setErrorMessage(null);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/lucky-draw/history", { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setErrorMessage(payload.error ?? messages.luckyHistory.unableToLoadHistory);
        setHistoryRows(mapMockHistory());
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as { data?: LuckyDrawHistoryRow[] };
      setHistoryRows(payload.data ?? []);
      setErrorMessage(null);
      setLoading(false);
    }

    loadHistory();
  }, [messages.luckyHistory.unableToLoadHistory, mode]);

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <Link href="/lucky-draw" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          {messages.luckyHistory.backToLuckyDraw}
        </Link>
        <h1 className="text-2xl font-semibold">{messages.luckyHistory.title}</h1>
        <p className="text-sm text-muted-foreground">{messages.luckyHistory.subtitle}</p>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">{messages.luckyHistory.loading}</p> : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      {!loading && !errorMessage && historyRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{messages.luckyHistory.noParticipationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{messages.luckyHistory.noParticipationDescription}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        {historyRows.map((row) => (
          <Card key={row.id}>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {resolveCampaignTitle(row.lucky_draw_campaigns, messages.luckyHistory.unknownCampaign)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {new Date(row.created_at).toLocaleString(getDateLocale(locale))}
                  </p>
                </div>
                <Badge variant={row.status === "won" ? "default" : "outline"}>
                  {translateMappedLabel(messages.labels.luckyStatus, row.status, row.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyHistory.pointsSpent}</p>
                  <p className="font-semibold">{row.points_spent}</p>
                </article>
                <article className="rounded-lg border bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{messages.luckyHistory.prize}</p>
                  <p className="font-semibold">{row.won_prize ?? "-"}</p>
                </article>
              </div>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Ticket className="h-3.5 w-3.5" />
                {messages.luckyHistory.entryId}: {row.id}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
