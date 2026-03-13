import { ManagementModule } from "@/components/admin/management-module";
import { adminMemberRows } from "@/lib/mock/admin";

const summary = [
  { id: "s1", label: "Total Members", value: "2,640", delta: "+21 today" },
  { id: "s2", label: "Gold Tier", value: "420", delta: "15.9%" },
  { id: "s3", label: "Active Rate", value: "82%", delta: "+3.1%" },
  { id: "s4", label: "Avg Points", value: "760", delta: "+8% MoM" }
];

export default function AdminMembersPage() {
  return (
    <ManagementModule
      title="Member Management"
      description="Track membership status, tiers, and loyalty points."
      ctaLabel="Add Member"
      summary={summary}
      rows={adminMemberRows}
      columns={[
        { key: "name", label: "Member Name" },
        { key: "tier", label: "Tier" },
        { key: "points", label: "Points" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" }
      ]}
      searchKeys={["name", "phone", "tier"]}
      searchPlaceholder="Search member..."
      filterKey="status"
      filterOptions={[
        { value: "all", label: "All Status" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
      formFields={[
        { key: "name", label: "Member Name", placeholder: "Member name" },
        { key: "phone", label: "Phone", placeholder: "Phone number" },
        {
          key: "tier",
          label: "Tier",
          type: "select",
          options: [
            { value: "Bronze", label: "Bronze" },
            { value: "Silver", label: "Silver" },
            { value: "Gold", label: "Gold" }
          ]
        },
        { key: "points", label: "Points", type: "number", placeholder: "0" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" }
          ]
        }
      ]}
    />
  );
}

