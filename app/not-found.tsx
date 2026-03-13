import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page may have moved or does not exist.</p>
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
    </main>
  );
}
