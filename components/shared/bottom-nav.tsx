"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Gift, Home, Menu, Sparkles, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomNavProps {
  items: readonly {
    href: Route;
    label: string;
  }[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  const iconMap: Record<string, ReactNode> = {
    "/": <Home className="h-4 w-4" />,
    "/menu": <Menu className="h-4 w-4" />,
    "/promotions": <Sparkles className="h-4 w-4" />,
    "/lucky-draw": <Gift className="h-4 w-4" />,
    "/profile": <UserRound className="h-4 w-4" />
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]">
      <ul
        className="mx-auto mb-2 grid max-w-md rounded-2xl border border-border/70 bg-background/95 shadow-lg shadow-black/5 backdrop-blur"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {iconMap[item.href] ?? null}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
