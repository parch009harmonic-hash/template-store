import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { PwaRegister } from "@/components/shared/pwa-register";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: {
    default: "Restaurant PWA",
    template: "%s | Restaurant PWA"
  },
  description: "Production-ready mobile-first restaurant app with customer and admin areas.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restaurant PWA"
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d25a10"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
