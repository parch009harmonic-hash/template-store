import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Flame, Star, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { translateMappedLabel } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { customerMenuItems } from "@/lib/mock/customer";
import { cn } from "@/lib/utils";

interface MenuDetailPageProps {
  params: Promise<{ itemId: string }>;
}

export default async function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { messages } = await getServerI18n();
  const { itemId } = await params;
  const item = customerMenuItems.find((menuItem) => menuItem.id === itemId);

  if (!item) notFound();

  return (
    <div className="space-y-4">
      <Link href="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" />
        {messages.menu.backToMenu}
      </Link>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className={cn("h-44 bg-gradient-to-r", item.imageStyle)} />
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{item.name}</h1>
            <p className="text-xl font-semibold text-primary">THB {item.price}</p>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{messages.labels.category[item.category] ?? item.category}</Badge>
            <Badge variant="outline">
              {item.calories} {messages.menu.caloriesUnit}
            </Badge>
          </div>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              {item.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="h-4 w-4" />
              {item.prepTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              {translateMappedLabel(messages.labels.spicy, item.spicyLevel, item.spicyLevel)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button className={buttonVariants({ variant: "outline", className: "w-full" })}>
          {messages.menu.addToWishlist}
        </button>
        <button className={buttonVariants({ className: "w-full bg-[#d15b13] hover:bg-[#b94e11]" })}>
          {messages.menu.addToCart}
        </button>
      </div>
    </div>
  );
}
