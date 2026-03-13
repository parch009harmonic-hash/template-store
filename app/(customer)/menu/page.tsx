"use client";

import { useMemo, useState } from "react";

import { MenuItemCard } from "@/components/customer/menu-item-card";
import { useI18n } from "@/components/shared/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { customerMenuItems, menuCategories } from "@/lib/mock/customer";

export default function CustomerMenuPage() {
  const { messages } = useI18n();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof menuCategories)[number]>("All");

  const filteredItems = useMemo(() => {
    return customerMenuItems.filter((item) => {
      const categoryMatched = activeCategory === "All" || item.category === activeCategory;
      const queryMatched =
        query.trim().length === 0 ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      return categoryMatched && queryMatched;
    });
  }, [activeCategory, query]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">{messages.menu.title}</h1>
        <p className="text-sm text-muted-foreground">{messages.menu.subtitle}</p>
      </header>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={messages.menu.searchPlaceholder}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {menuCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className="shrink-0"
          >
            <Badge
              variant={activeCategory === category ? "default" : "outline"}
              className={activeCategory === category ? "bg-primary text-primary-foreground" : ""}
            >
              {messages.labels.category[category] ?? category}
            </Badge>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
