import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: Route;
  action?: ReactNode;
}

export function SectionHeader({ title, actionLabel, actionHref, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      {action ? action : null}
      {!action && actionLabel && actionHref ? (
        <Link href={actionHref} className="text-sm font-medium text-primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
