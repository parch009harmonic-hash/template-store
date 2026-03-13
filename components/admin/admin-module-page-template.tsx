import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";
import { Card, CardContent } from "@/components/ui/card";

interface AdminModulePageTemplateProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function AdminModulePageTemplate({
  title,
  subtitle,
  toolbar,
  children
}: AdminModulePageTemplateProps) {
  return (
    <div className="space-y-4">
      <AppHeader title={title} subtitle={subtitle} actions={toolbar} />
      <Card>
        <CardContent className="pt-4">{children}</CardContent>
      </Card>
    </div>
  );
}
