"use client";

import Link from "next/link";

import { HeroBanner } from "@/components/customer/hero-banner";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { PromotionCard } from "@/components/customer/promotion-card";
import { SectionHeader } from "@/components/customer/section-header";
import { useI18n } from "@/components/shared/locale-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { translateMappedLabel } from "@/lib/i18n";
import { customerMenuItems, customerPromotions, customerRestaurant } from "@/lib/mock/customer";

export default function CustomerHomePage() {
  const { messages } = useI18n();
  const featuredItems = customerMenuItems.filter((item) => item.isFeatured);
  const memberTierLabel = translateMappedLabel(
    messages.labels.membershipTier,
    customerRestaurant.memberTier,
    messages.labels.guest
  );

  return (
    <div className="space-y-5">
      <HeroBanner />

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{messages.home.membership}</p>
            <p className="text-lg font-semibold">
              {memberTierLabel} {messages.home.member}
            </p>
          </div>
          <Badge className="bg-[#2f7d5d]">
            {customerRestaurant.points} {messages.labels.pointsShort}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/lucky-draw" className="rounded-xl bg-muted px-3 py-2 text-sm font-medium">
            {messages.home.luckyDraw}
          </Link>
          <Link href="/member/login" className="rounded-xl bg-muted px-3 py-2 text-sm font-medium">
            {messages.home.memberLogin}
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title={messages.home.featuredMenu}
          actionLabel={messages.home.viewAll}
          actionHref="/menu"
        />
        <div className="space-y-3">
          {featuredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={messages.home.todayPromotions}
          actionLabel={messages.home.seeMore}
          actionHref="/promotions"
        />
        <div className="space-y-3">
          {customerPromotions.slice(0, 2).map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </section>

      <Link
        href="/menu"
        className={buttonVariants({
          className: "w-full bg-[#d15b13] py-6 text-base font-semibold hover:bg-[#b94e11]"
        })}
      >
        {messages.home.startOrdering}
      </Link>
    </div>
  );
}
