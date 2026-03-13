import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface CustomerModulePageTemplateProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function CustomerModulePageTemplate({
  title,
  subtitle,
  actions,
  children
}: CustomerModulePageTemplateProps) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      {actions ? (
        <Card>
          <CardContent className="pt-4">{actions}</CardContent>
        </Card>
      ) : null}
      <section className="space-y-3">{children}</section>
    </div>
  );
}
