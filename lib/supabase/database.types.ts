export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<{
        id: string;
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        default_restaurant_id: string | null;
        app_role: "customer" | "staff" | "admin";
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      restaurants: TableDef<{
        id: string;
        owner_profile_id: string;
        name: string;
        slug: string;
        description: string | null;
        phone: string | null;
        address: string | null;
        timezone: string;
        currency_code: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      admin_users: TableDef<{
        id: string;
        restaurant_id: string;
        profile_id: string;
        role: "staff" | "admin" | "owner";
        is_active: boolean;
        invited_by: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      categories: TableDef<{
        id: string;
        restaurant_id: string;
        name: string;
        description: string | null;
        sort_order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      menu_items: TableDef<{
        id: string;
        restaurant_id: string;
        category_id: string | null;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        sku: string | null;
        sort_order: number;
        is_available: boolean;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      promo_campaigns: TableDef<{
        id: string;
        restaurant_id: string;
        title: string;
        description: string | null;
        discount_type: "percentage" | "fixed_amount" | "free_item";
        discount_value: number;
        starts_at: string;
        ends_at: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      lucky_draw_campaigns: TableDef<{
        id: string;
        restaurant_id: string;
        title: string;
        description: string | null;
        starts_at: string;
        ends_at: string;
        status: "active" | "inactive";
        entry_cost_points: number;
        max_entries_per_member: number;
        max_total_entries: number | null;
        min_membership_tier: "bronze" | "silver" | "gold" | "platinum";
        requires_active_membership: boolean;
        total_entries: number;
        created_by: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      lucky_draw_entries: TableDef<{
        id: string;
        restaurant_id: string;
        membership_id: string | null;
        profile_id: string;
        campaign_id: string | null;
        lucky_draw_campaign_id: string | null;
        ticket_no: number;
        points_spent: number;
        draw_date: string | null;
        status: "pending" | "won" | "lost" | "claimed";
        won_prize: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      memberships: TableDef<{
        id: string;
        restaurant_id: string;
        profile_id: string;
        tier: "bronze" | "silver" | "gold" | "platinum";
        status: "active" | "inactive" | "blocked";
        points: number;
        joined_at: string;
        expires_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      notifications: TableDef<{
        id: string;
        restaurant_id: string;
        profile_id: string;
        type: "general" | "promo" | "membership" | "system";
        title: string;
        message: string;
        payload: Json;
        created_by: string | null;
        read_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      push_subscriptions: TableDef<{
        id: string;
        profile_id: string;
        restaurant_id: string | null;
        endpoint: string;
        p256dh: string;
        auth: string;
        user_agent: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        deactivated_at: string | null;
      }>;
      notification_broadcasts: TableDef<{
        id: string;
        restaurant_id: string;
        sent_by_profile_id: string | null;
        title: string;
        message: string;
        payload: Json;
        target_scope: string;
        total_subscribers: number;
        total_sent: number;
        total_failed: number;
        created_at: string;
        updated_at: string;
      }>;
      notification_dispatch_logs: TableDef<{
        id: string;
        broadcast_id: string;
        subscription_id: string | null;
        profile_id: string | null;
        status: "sent" | "failed";
        error_message: string | null;
        created_at: string;
      }>;
      audit_logs: TableDef<{
        id: string;
        restaurant_id: string;
        actor_profile_id: string | null;
        actor_admin_user_id: string | null;
        action: string;
        entity_table: string;
        entity_id: string;
        old_data: Json | null;
        new_data: Json | null;
        ip_address: string | null;
        user_agent: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      admin_role: "staff" | "admin" | "owner";
      membership_tier: "bronze" | "silver" | "gold" | "platinum";
      membership_status: "active" | "inactive" | "blocked";
      promo_discount_type: "percentage" | "fixed_amount" | "free_item";
      lucky_draw_status: "pending" | "won" | "lost" | "claimed";
      lucky_draw_campaign_status: "active" | "inactive";
      notification_type: "general" | "promo" | "membership" | "system";
      app_user_role: "customer" | "staff" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
}
