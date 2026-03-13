export type AdminRole = "staff" | "admin" | "owner";
export type MembershipTier = "bronze" | "silver" | "gold" | "platinum";
export type MembershipStatus = "active" | "inactive" | "blocked";
export type NotificationType = "general" | "promo" | "membership" | "system";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  default_restaurant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  owner_profile_id: string;
  name: string;
  slug: string;
  currency_code: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoCampaign {
  id: string;
  restaurant_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

