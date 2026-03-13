export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
}

export interface AdminRow {
  id: string;
  [key: string]: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  { id: "m1", label: "Today Revenue", value: "THB 48,320", delta: "+12.8%" },
  { id: "m2", label: "Orders Today", value: "214", delta: "+9.2%" },
  { id: "m3", label: "Active Members", value: "2,640", delta: "+4.7%" },
  { id: "m4", label: "Campaign CTR", value: "18.4%", delta: "+2.1%" }
];

export const recentActivities: AdminRow[] = [
  {
    id: "a1",
    time: "10:02",
    action: "Menu updated",
    detail: "Truffle Massaman price adjusted",
    actor: "Admin (May)"
  },
  {
    id: "a2",
    time: "09:48",
    action: "Campaign started",
    detail: "Lunch Signature Set 20% Off",
    actor: "Marketing Staff"
  },
  {
    id: "a3",
    time: "09:15",
    action: "Notification sent",
    detail: "Weekend dessert campaign blast",
    actor: "Admin (Korn)"
  }
];

export const adminMenuRows: AdminRow[] = [
  {
    id: "m1",
    name: "Tom Yum Linguine",
    category: "Noodles",
    price: "245",
    status: "Available",
    updated: "2026-03-12"
  },
  {
    id: "m2",
    name: "Truffle Massaman Beef",
    category: "Main",
    price: "320",
    status: "Available",
    updated: "2026-03-12"
  },
  {
    id: "m3",
    name: "Charcoal Mango Sticky Rice",
    category: "Dessert",
    price: "165",
    status: "Low Stock",
    updated: "2026-03-11"
  }
];

export const adminCategoryRows: AdminRow[] = [
  { id: "c1", name: "Main", sortOrder: "1", menuCount: "14", status: "Active" },
  { id: "c2", name: "Noodles", sortOrder: "2", menuCount: "9", status: "Active" },
  { id: "c3", name: "Dessert", sortOrder: "3", menuCount: "7", status: "Active" },
  { id: "c4", name: "Beverage", sortOrder: "4", menuCount: "11", status: "Draft" }
];

export const adminMemberRows: AdminRow[] = [
  {
    id: "mb1",
    name: "Nattapong S.",
    tier: "Gold",
    points: "1240",
    phone: "+66 81 234 5678",
    status: "Active"
  },
  {
    id: "mb2",
    name: "Pimchanok T.",
    tier: "Silver",
    points: "880",
    phone: "+66 86 001 2211",
    status: "Active"
  },
  {
    id: "mb3",
    name: "Anan K.",
    tier: "Bronze",
    points: "240",
    phone: "+66 95 889 9012",
    status: "Inactive"
  }
];

export const adminPromotionRows: AdminRow[] = [
  {
    id: "p1",
    title: "Lunch Signature Set 20% Off",
    type: "Percentage",
    period: "2026-03-01 to 2026-03-31",
    status: "Active"
  },
  {
    id: "p2",
    title: "Gold Member Free Mocktail",
    type: "Free Item",
    period: "Always",
    status: "Active"
  },
  {
    id: "p3",
    title: "Songkran Lucky Draw",
    type: "Points Campaign",
    period: "2026-04-10 to 2026-04-16",
    status: "Scheduled"
  }
];

export const adminNotificationRows: AdminRow[] = [
  {
    id: "n1",
    title: "Weekend Dessert Blast",
    target: "All Members",
    channel: "In-App",
    status: "Sent",
    sentAt: "2026-03-11 18:05"
  },
  {
    id: "n2",
    title: "Gold Tier Privilege",
    target: "Gold Members",
    channel: "Push",
    status: "Scheduled",
    sentAt: "2026-03-13 11:00"
  },
  {
    id: "n3",
    title: "Store Renovation Notice",
    target: "All Members",
    channel: "In-App",
    status: "Draft",
    sentAt: "-"
  }
];

export const adminBroadcastHistory: AdminRow[] = [
  {
    id: "b1",
    title: "Weekend Dessert Blast",
    total_subscribers: "1364",
    total_sent: "1288",
    total_failed: "76",
    created_at: "2026-03-11 18:05"
  },
  {
    id: "b2",
    title: "Gold Tier Privilege",
    total_subscribers: "420",
    total_sent: "401",
    total_failed: "19",
    created_at: "2026-03-10 11:20"
  }
];
