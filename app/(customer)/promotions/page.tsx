"use client";

import Link from "next/link";

import { PromotionCard } from "@/components/customer/promotion-card";
import { useI18n } from "@/components/shared/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { customerPromotions } from "@/lib/mock/customer";

export default function PromotionsPage() {
  const { messages } = useI18n();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">{messages.promotions.title}</h1>
        <p className="text-sm text-muted-foreground">{messages.promotions.subtitle}</p>
      </header>

      <div className="space-y-3">
        {customerPromotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>

      <Link
        href="/member/register"
        className={buttonVariants({
          className: "w-full bg-[#d15b13] py-6 text-base font-semibold hover:bg-[#b94e11]"
        })}
      >
        {messages.promotions.becomeMember}
      </Link>
    </div>
  );
}
