"use client";

import { BadgePercent, Ticket } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import { Badge } from "@/components/ui/badge";
import type { PromotionItem } from "@/lib/mock/customer";

interface PromotionCardProps {
  promotion: PromotionItem;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const { messages } = useI18n();

  return (
    <article className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary" className="bg-[#f4e1cd] text-[#7a4a1f]">
          {promotion.tag}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <BadgePercent className="h-3.5 w-3.5" />
          {messages.promotions.ends} {promotion.validUntil}
        </span>
      </div>
      <h3 className="text-base font-semibold">{promotion.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{promotion.subtitle}</p>
      <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
        <Ticket className="h-3.5 w-3.5" />
        {messages.promotions.code}: {promotion.code}
      </div>
    </article>
  );
}
