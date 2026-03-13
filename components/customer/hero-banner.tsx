"use client";

import Link from "next/link";

import { useI18n } from "@/components/shared/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { customerRestaurant } from "@/lib/mock/customer";

export function HeroBanner() {
  const { messages } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#efcfb4] bg-gradient-to-br from-[#2f2016] via-[#4a2c1a] to-[#955122] p-5 text-[#fef5ec] shadow-lg shadow-[#b96a3326]">
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#f2ab6f33] blur-2xl" />
      <p className="text-xs uppercase tracking-[0.16em] text-[#f8d4b8]">{messages.hero.chefSelection}</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight">{customerRestaurant.name}</h1>
      <p className="mt-2 text-sm text-[#f8dcc6]">{messages.hero.subtitle}</p>
      <p className="mt-1 text-xs text-[#f8dcc6]">{messages.hero.openHours}</p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/menu"
          className={buttonVariants({
            className: "flex-1 bg-[#f3c08f] text-[#4a2d1d] hover:bg-[#eab47e]"
          })}
        >
          {messages.hero.orderNow}
        </Link>
        <Link
          href="/member/register"
          className={buttonVariants({
            variant: "outline",
            className: "flex-1 border-[#f8d4b8] bg-transparent text-[#fef5ec]"
          })}
        >
          {messages.hero.joinMember}
        </Link>
      </div>
    </section>
  );
}
