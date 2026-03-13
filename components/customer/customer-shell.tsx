"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { BottomNav } from "@/components/shared/bottom-nav";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { useI18n } from "@/components/shared/locale-provider";
import { ResponsiveShell } from "@/components/shared/responsive-shell";
import { CUSTOMER_NAV_ITEMS } from "@/lib/constants";

interface CustomerShellProps {
  children: ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/member/");
  const { messages } = useI18n();

  const navItems = CUSTOMER_NAV_ITEMS.map((item) => {
    if (item.href === "/") return { ...item, label: messages.nav.home };
    if (item.href === "/menu") return { ...item, label: messages.nav.menu };
    if (item.href === "/promotions") return { ...item, label: messages.nav.promotions };
    if (item.href === "/lucky-draw") return { ...item, label: messages.nav.luckyDraw };
    if (item.href === "/profile") return { ...item, label: messages.nav.profile };
    return item;
  });

  return (
    <>
      <ResponsiveShell className="max-w-md pb-28">
        <div className="mb-3 flex justify-end gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        {children}
      </ResponsiveShell>
      {!isAuthPage ? <BottomNav items={navItems} /> : null}
    </>
  );
}
