import { ManagementModule } from "@/components/admin/management-module";
import { adminPromotionRows } from "@/lib/mock/admin";
import { getAdminContext } from "@/lib/supabase/auth";

const summary = [
  { id: "s1", label: "Active Campaigns", value: "2", delta: "Running now" },
  { id: "s2", label: "Scheduled", value: "1", delta: "Next week" },
  { id: "s3", label: "Avg Conversion", value: "18.4%", delta: "+2.1%" },
  { id: "s4", label: "Promo Revenue", value: "THB 192,400", delta: "+14.2%" }
];

export default async function AdminPromotionsPage() {
  const adminContext = await getAdminContext("staff");
  const isLive = Boolean(adminContext?.restaurantId);

  return (
    <ManagementModule
      title="Promotion Management"
      description="Maintain promotions, periods, and campaign statuses."
      ctaLabel="Create Promotion"
      summary={summary}
      rows={isLive ? [] : adminPromotionRows}
      columns={[
        { key: "title", label: "Promotion Title" },
        { key: "discount_type", label: "Type" },
        { key: "discount_value", label: "Value" },
        { key: "starts_at", label: "Start" },
        { key: "ends_at", label: "End" },
        { key: "is_active", label: "Active" }
      ]}
      searchKeys={["title", "description", "discount_type"]}
      searchPlaceholder="Search promotion..."
      filterKey="is_active"
      filterOptions={[
        { value: "all", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ]}
      formFields={[
        { key: "title", label: "Promotion Title", placeholder: "Campaign title" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional" },
        {
          key: "discount_type",
          label: "Type",
          type: "select",
          options: [
            { value: "percentage", label: "Percentage" },
            { value: "fixed_amount", label: "Fixed Amount" },
            { value: "free_item", label: "Free Item" }
          ]
        },
        { key: "discount_value", label: "Discount Value", type: "number", placeholder: "0" },
        { key: "starts_at", label: "Starts At", type: "datetime-local" },
        { key: "ends_at", label: "Ends At", type: "datetime-local" },
        {
          key: "is_active",
          label: "Active",
          type: "select",
          options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" }
          ]
        }
      ]}
      api={{
        mode: isLive ? "live" : "mock",
        restaurantId: adminContext?.restaurantId ?? null,
        listEndpoint: "/api/admin/promo-campaigns",
        itemEndpoint: "/api/admin/promo-campaigns",
        restaurantIdKey: "restaurant_id",
        fieldTypes: {
          description: "nullable_string",
          discount_value: "number",
          starts_at: "iso_datetime",
          ends_at: "iso_datetime",
          is_active: "boolean"
        }
      }}
    />
  );
}
