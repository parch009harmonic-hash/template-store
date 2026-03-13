import { ManagementModule } from "@/components/admin/management-module";
import { PromotionBroadcastPanel } from "@/components/admin/promotion-broadcast-panel";
import { adminNotificationRows } from "@/lib/mock/admin";
import { getAdminContext } from "@/lib/supabase/auth";

const summary = [
  { id: "s1", label: "Sent Today", value: "12", delta: "+5 vs yesterday" },
  { id: "s2", label: "Scheduled", value: "4", delta: "Pending delivery" },
  { id: "s3", label: "Open Rate", value: "39.2%", delta: "+4.2%" },
  { id: "s4", label: "Draft", value: "3", delta: "Need approval" }
];

export default async function AdminNotificationsPage() {
  const adminContext = await getAdminContext("staff");
  const mode = adminContext?.restaurantId ? "live" : "mock";
  const canBroadcast = adminContext?.role === "admin" || adminContext?.role === "owner";

  return (
    <div className="space-y-4">
      <ManagementModule
        title="Notification Management"
        description="Create and manage in-app notification campaigns."
        ctaLabel="Create Notification"
        summary={summary}
        rows={adminNotificationRows}
        columns={[
          { key: "title", label: "Title" },
          { key: "target", label: "Target" },
          { key: "channel", label: "Channel" },
          { key: "status", label: "Status" },
          { key: "sentAt", label: "Sent At" }
        ]}
        searchKeys={["title", "target", "channel"]}
        searchPlaceholder="Search notification..."
        filterKey="status"
        filterOptions={[
          { value: "all", label: "All Status" },
          { value: "Sent", label: "Sent" },
          { value: "Scheduled", label: "Scheduled" },
          { value: "Draft", label: "Draft" }
        ]}
        formFields={[
          { key: "title", label: "Title", placeholder: "Notification title" },
          {
            key: "target",
            label: "Target Segment",
            type: "select",
            options: [
              { value: "All Members", label: "All Members" },
              { value: "Gold Members", label: "Gold Members" },
              { value: "Silver Members", label: "Silver Members" }
            ]
          },
          {
            key: "channel",
            label: "Channel",
            type: "select",
            options: [
              { value: "In-App", label: "In-App" },
              { value: "Push", label: "Push" }
            ]
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "Draft", label: "Draft" },
              { value: "Scheduled", label: "Scheduled" },
              { value: "Sent", label: "Sent" }
            ]
          },
          { key: "sentAt", label: "Schedule Time", placeholder: "YYYY-MM-DD HH:mm" }
        ]}
      />
      <PromotionBroadcastPanel
        restaurantId={adminContext?.restaurantId ?? null}
        mode={mode}
        canBroadcast={canBroadcast}
      />
    </div>
  );
}
