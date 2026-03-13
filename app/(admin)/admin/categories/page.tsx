import { ManagementModule } from "@/components/admin/management-module";
import { adminCategoryRows } from "@/lib/mock/admin";
import { getAdminContext } from "@/lib/supabase/auth";

const summary = [
  { id: "s1", label: "Total Categories", value: "8", delta: "+1 this quarter" },
  { id: "s2", label: "Active", value: "7", delta: "Operational" },
  { id: "s3", label: "Draft", value: "1", delta: "Pending review" },
  { id: "s4", label: "Avg Items/Category", value: "10", delta: "Balanced mix" }
];

export default async function AdminCategoriesPage() {
  const adminContext = await getAdminContext("staff");
  const isLive = Boolean(adminContext?.restaurantId);

  return (
    <ManagementModule
      title="Category Management"
      description="Control menu structure and display ordering."
      ctaLabel="Create Category"
      summary={summary}
      rows={isLive ? [] : adminCategoryRows}
      columns={[
        { key: "name", label: "Category Name" },
        { key: "description", label: "Description" },
        { key: "sort_order", label: "Sort Order" },
        { key: "is_active", label: "Active" },
        { key: "updated_at", label: "Updated At" }
      ]}
      searchKeys={["name", "description"]}
      searchPlaceholder="Search category..."
      filterKey="is_active"
      filterOptions={[
        { value: "all", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ]}
      formFields={[
        { key: "name", label: "Category Name", placeholder: "Category name" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional" },
        { key: "sort_order", label: "Sort Order", type: "number", placeholder: "1" },
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
        listEndpoint: "/api/admin/categories",
        itemEndpoint: "/api/admin/categories",
        restaurantIdKey: "restaurant_id",
        fieldTypes: {
          description: "nullable_string",
          sort_order: "number",
          is_active: "boolean"
        }
      }}
    />
  );
}
