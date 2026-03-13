"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error("app.global_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-semibold">Application Error</h1>
          <p className="text-sm text-muted-foreground">
            A critical error occurred while rendering this page.
          </p>
          <Button onClick={() => reset()}>Reload</Button>
        </main>
      </body>
    </html>
  );
}
