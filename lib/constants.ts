export const CUSTOMER_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/promotions", label: "Promos" },
  { href: "/lucky-draw", label: "Lucky" },
  { href: "/profile", label: "Profile" }
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/campaigns", label: "Lucky Draw" },
  { href: "/admin/notifications", label: "Notifications" }
] as const;
