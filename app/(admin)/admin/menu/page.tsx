import { ManagementModule } from "@/components/admin/management-module";
import { adminMenuRows } from "@/lib/mock/admin";
import { getAdminContext } from "@/lib/supabase/auth";

const summary = [
  { id: "s1", label: "Total Menu", value: "41", delta: "+3 this month" },
  { id: "s2", label: "Available", value: "36", delta: "87.8% live" },
  { id: "s3", label: "Low Stock", value: "4", delta: "Needs review" },
  { id: "s4", label: "Best Seller", value: "Tom Yum Linguine", delta: "42 orders today" }
];

export default async function AdminMenuPage() {
  const adminContext = await getAdminContext("staff");
  const isLive = Boolean(adminContext?.restaurantId);

  return (
    <ManagementModule
      title="Menu Management"
      description="Manage menu items, availability, and pricing."
      ctaLabel="Create Menu"
      summary={summary}
      rows={isLive ? [] : adminMenuRows}
      columns={[
        { key: "name", label: "Name" },
        { key: "category_id", label: "Category ID" },
        { key: "price", label: "Price (THB)" },
        { key: "sku", label: "SKU" },
        { key: "is_available", label: "Available" },
        { key: "updated_at", label: "Updated" }
      ]}
      searchKeys={["name", "description", "sku"]}
      searchPlaceholder="Search menu item..."
      filterKey="is_available"
      filterOptions={[
        { value: "all", label: "All" },
        { value: "true", label: "Available" },
        { value: "false", label: "Unavailable" }
      ]}
      formFields={[
        { key: "name", label: "Menu Name", placeholder: "Item name" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional" },
        { key: "category_id", label: "Category ID", placeholder: "UUID or leave blank" },
        { key: "price", label: "Price", type: "number", placeholder: "0" },
        { key: "sku", label: "SKU", placeholder: "Optional" },
        { key: "image_url", label: "Image URL", placeholder: "Optional" },
        { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
        {
          key: "is_available",
          label: "Available",
          type: "select",
          options: [
            { value: "true", label: "Available" },
            { value: "false", label: "Unavailable" }
          ]
        }
      ]}
      api={{
        mode: isLive ? "live" : "mock",
        restaurantId: adminContext?.restaurantId ?? null,
        listEndpoint: "/api/admin/menu-items",
        itemEndpoint: "/api/admin/menu-items",
        restaurantIdKey: "restaurant_id",
        fieldTypes: {
          description: "nullable_string",
          category_id: "nullable_string",
          price: "number",
          sort_order: "number",
          is_available: "boolean",
          sku: "nullable_string",
          image_url: "nullable_string"
        }
      }}
    />
  );
}
