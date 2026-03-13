import type { ReactNode } from "react";

import { CustomerShell } from "@/components/customer/customer-shell";
import { LocaleProvider } from "@/components/shared/locale-provider";
import { getServerLocale } from "@/lib/i18n/server";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default async function CustomerLayout({ children }: CustomerLayoutProps) {
  const locale = await getServerLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <CustomerShell>{children}</CustomerShell>
    </LocaleProvider>
  );
}

