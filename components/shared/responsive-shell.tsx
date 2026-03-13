import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ResponsiveShellProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveShell({ children, className }: ResponsiveShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  );
}
