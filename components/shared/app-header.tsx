import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function AppHeader({ title, subtitle, actions, className }: AppHeaderProps) {
  return (
    <header className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
