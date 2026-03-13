"use client";

import Link from "next/link";
import { Flame, Star, Timer } from "lucide-react";

import { useI18n } from "@/components/shared/locale-provider";
import type { CustomerMenuItem } from "@/lib/mock/customer";
import { translateMappedLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: CustomerMenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { messages } = useI18n();

  return (
    <Link
      href={`/menu/${item.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={cn("relative h-32 bg-gradient-to-r", item.imageStyle)}>
        {item.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Chef Pick
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold">{item.name}</h3>
            <p className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
              THB {item.price}
            </p>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground transition-colors group-hover:text-foreground/80">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {item.rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {item.prepTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {translateMappedLabel(messages.labels.spicy, item.spicyLevel, item.spicyLevel)}
          </span>
        </div>
      </div>
    </Link>
  );
}
