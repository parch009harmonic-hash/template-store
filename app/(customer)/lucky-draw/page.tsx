import { LuckyDrawCampaignList } from "@/components/customer/lucky-draw-campaign-list";
import { requireCustomerUser } from "@/lib/supabase/auth";

export default async function LuckyDrawPage() {
  await requireCustomerUser();

  return <LuckyDrawCampaignList mode="live" />;
}
