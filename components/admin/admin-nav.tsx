"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellRing,
  ChartNoAxesCombined,
  Gift,
  LayoutGrid,
  MenuSquare,
  Sparkles,
  UsersRound
} from "lucide-react";

import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function AdminNav({ orientation = "horizontal", className }: AdminNavProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";

  const iconMap: Record<string, ReactNode> = {
    "/admin": <LayoutGrid className="h-4 w-4" />,
    "/admin/menu": <MenuSquare className="h-4 w-4" />,
    "/admin/categories": <ChartNoAxesCombined className="h-4 w-4" />,
    "/admin/members": <UsersRound className="h-4 w-4" />,
    "/admin/promotions": <Sparkles className="h-4 w-4" />,
    "/admin/campaigns": <Gift className="h-4 w-4" />,
    "/admin/notifications": <BellRing className="h-4 w-4" />
  };

  return (
    <nav
      className={cn(
        isVertical ? "flex flex-col gap-1" : "-mx-1 flex gap-1 overflow-x-auto pb-1",
        className
      )}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "min-w-fit rounded-md px-3 py-2 text-sm transition-colors",
              isVertical ? "inline-flex items-center gap-2" : "",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {isVertical ? iconMap[item.href] ?? null : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
