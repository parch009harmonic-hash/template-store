export interface CustomerMenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  prepTime: string;
  calories: number;
  rating: number;
  spicyLevel: "Mild" | "Medium" | "Hot";
  imageStyle: string;
  isFeatured?: boolean;
}

export interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  validUntil: string;
  code: string;
}

export interface LuckyDrawCampaignItem {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "inactive";
  entryCostPoints: number;
  maxEntriesPerMember: number;
  existingEntries: number;
  minMembershipTier: "bronze" | "silver" | "gold" | "platinum";
}

export interface LuckyDrawHistoryItem {
  id: string;
  campaignTitle: string;
  status: "pending" | "won" | "lost" | "claimed";
  pointsSpent: number;
  wonPrize: string | null;
  createdAt: string;
}

export const customerRestaurant = {
  name: "Siam Atelier Kitchen",
  subtitle: "Modern Thai dining with member rewards",
  openHours: "Open daily 10:00 - 22:00",
  memberTier: "Gold",
  points: 1240
};

export const menuCategories = ["All", "Main", "Noodles", "Dessert", "Beverage"] as const;

export const customerMenuItems: CustomerMenuItem[] = [
  {
    id: "tom-yum-linguine",
    name: "Tom Yum Linguine",
    category: "Noodles",
    description: "Creamy tom yum sauce, tiger prawns, crispy shallots.",
    price: 245,
    prepTime: "12 min",
    calories: 540,
    rating: 4.8,
    spicyLevel: "Medium",
    imageStyle: "from-[#f17b2c] via-[#da4f13] to-[#8f2806]",
    isFeatured: true
  },
  {
    id: "truffle-massaman",
    name: "Truffle Massaman Beef",
    category: "Main",
    description: "Slow-cooked beef cheek, young potato, truffle aroma.",
    price: 320,
    prepTime: "18 min",
    calories: 660,
    rating: 4.9,
    spicyLevel: "Mild",
    imageStyle: "from-[#6e4f3a] via-[#4d3727] to-[#2f1f16]",
    isFeatured: true
  },
  {
    id: "charcoal-mango",
    name: "Charcoal Mango Sticky Rice",
    category: "Dessert",
    description: "Smoked coconut cream and ripe nam dok mai mango.",
    price: 165,
    prepTime: "7 min",
    calories: 420,
    rating: 4.7,
    spicyLevel: "Mild",
    imageStyle: "from-[#f0c061] via-[#dd9a2f] to-[#9e6115]"
  },
  {
    id: "lemongrass-soda",
    name: "Lemongrass Citrus Soda",
    category: "Beverage",
    description: "House-crafted syrup, sparkling water, lime zest.",
    price: 95,
    prepTime: "4 min",
    calories: 140,
    rating: 4.6,
    spicyLevel: "Mild",
    imageStyle: "from-[#8fc9b5] via-[#5aa081] to-[#2f6753]"
  }
];

export const customerPromotions: PromotionItem[] = [
  {
    id: "lunch-20",
    title: "Lunch Signature Set 20% Off",
    subtitle: "Available Monday-Friday, 11:00-14:00",
    tag: "Limited Time",
    validUntil: "31 Mar 2026",
    code: "LUNCH20"
  },
  {
    id: "gold-drink",
    title: "Gold Member Free Mocktail",
    subtitle: "Redeem with any main dish order",
    tag: "Member",
    validUntil: "Always",
    code: "GOLDSIP"
  },
  {
    id: "weekend-dessert",
    title: "Weekend Dessert 1-for-1",
    subtitle: "Selected desserts, Saturday-Sunday",
    tag: "Weekend",
    validUntil: "30 Apr 2026",
    code: "SWEET2"
  }
];

export const luckyDrawPrizes = [
  { id: "p1", title: "Dinner Voucher", value: "THB 1,000", odds: "1%" },
  { id: "p2", title: "Free Signature Main", value: "1 Dish", odds: "8%" },
  { id: "p3", title: "Bonus Points", value: "500 pts", odds: "20%" },
  { id: "p4", title: "Consolation", value: "50 pts", odds: "71%" }
];

export const luckyDrawCampaigns: LuckyDrawCampaignItem[] = [
  {
    id: "campaign-gold-weekend",
    title: "Weekend Gold Spin",
    description: "Join this weekend draw for premium dining rewards.",
    startsAt: "2026-03-10T10:00:00+07:00",
    endsAt: "2026-03-30T22:00:00+07:00",
    status: "active",
    entryCostPoints: 100,
    maxEntriesPerMember: 3,
    existingEntries: 1,
    minMembershipTier: "gold"
  },
  {
    id: "campaign-silver-lunch",
    title: "Lunch Lucky Box",
    description: "Midday draw for free drink, dessert, and bonus points.",
    startsAt: "2026-03-01T10:00:00+07:00",
    endsAt: "2026-03-25T22:00:00+07:00",
    status: "active",
    entryCostPoints: 60,
    maxEntriesPerMember: 5,
    existingEntries: 2,
    minMembershipTier: "silver"
  }
];

export const luckyDrawHistory: LuckyDrawHistoryItem[] = [
  {
    id: "entry-20260301-0001",
    campaignTitle: "Weekend Gold Spin",
    status: "won",
    pointsSpent: 100,
    wonPrize: "Free Signature Main",
    createdAt: "2026-03-11T18:12:00+07:00"
  },
  {
    id: "entry-20260301-0002",
    campaignTitle: "Lunch Lucky Box",
    status: "lost",
    pointsSpent: 60,
    wonPrize: null,
    createdAt: "2026-03-09T12:35:00+07:00"
  }
];

export const memberProfile = {
  fullName: "Nattapong S.",
  email: "nattapong@example.com",
  phone: "+66 81 234 5678",
  tier: "Gold",
  points: 1240,
  visits: 26,
  luckyTickets: 8
};
