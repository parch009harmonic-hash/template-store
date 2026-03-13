import { LuckyDrawCampaignManager } from "@/components/admin/lucky-draw-campaign-manager";
import { requireAdminUser } from "@/lib/supabase/auth";

export default async function AdminLuckyDrawCampaignsPage() {
  const adminContext = await requireAdminUser();

  if (!adminContext.restaurantId) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Lucky Draw Campaign Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This account does not have restaurant context. Please contact system administrator.
        </p>
      </section>
    );
  }

  return <LuckyDrawCampaignManager restaurantId={adminContext.restaurantId} />;
}
