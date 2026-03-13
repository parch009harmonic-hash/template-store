import { LuckyDrawHistoryList } from "@/components/customer/lucky-draw-history-list";
import { requireCustomerUser } from "@/lib/supabase/auth";

export default async function LuckyDrawHistoryPage() {
  await requireCustomerUser();

  return <LuckyDrawHistoryList mode="live" />;
}
