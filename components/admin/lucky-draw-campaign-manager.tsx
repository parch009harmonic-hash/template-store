"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { ModuleToolbar } from "@/components/admin/module-toolbar";
import { SummaryCards } from "@/components/admin/summary-cards";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardMetric } from "@/lib/mock/admin";
import type { Database } from "@/lib/supabase/database.types";

type LuckyDrawCampaignRow = Database["public"]["Tables"]["lucky_draw_campaigns"]["Row"];
type MembershipTier = Database["public"]["Enums"]["membership_tier"];
type LuckyDrawCampaignStatus = Database["public"]["Enums"]["lucky_draw_campaign_status"];

interface LuckyDrawCampaignManagerProps {
  restaurantId: string;
}

interface CampaignFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: LuckyDrawCampaignStatus;
  entryCostPoints: string;
  maxEntriesPerMember: string;
  maxTotalEntries: string;
  minMembershipTier: MembershipTier;
  requiresActiveMembership: boolean;
}

const membershipTierOptions: MembershipTier[] = ["bronze", "silver", "gold", "platinum"];
const campaignStatusOptions: LuckyDrawCampaignStatus[] = ["active", "inactive"];

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  return new Date(value).toISOString();
}

function createDefaultFormState(): CampaignFormState {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  return {
    title: "",
    description: "",
    startsAt: toDateTimeLocal(now.toISOString()),
    endsAt: toDateTimeLocal(end.toISOString()),
    status: "inactive",
    entryCostPoints: "0",
    maxEntriesPerMember: "1",
    maxTotalEntries: "",
    minMembershipTier: "bronze",
    requiresActiveMembership: true
  };
}

function toFormState(campaign: LuckyDrawCampaignRow): CampaignFormState {
  return {
    title: campaign.title,
    description: campaign.description ?? "",
    startsAt: toDateTimeLocal(campaign.starts_at),
    endsAt: toDateTimeLocal(campaign.ends_at),
    status: campaign.status,
    entryCostPoints: String(campaign.entry_cost_points),
    maxEntriesPerMember: String(campaign.max_entries_per_member),
    maxTotalEntries: campaign.max_total_entries !== null ? String(campaign.max_total_entries) : "",
    minMembershipTier: campaign.min_membership_tier,
    requiresActiveMembership: campaign.requires_active_membership
  };
}

export function LuckyDrawCampaignManager({ restaurantId }: LuckyDrawCampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<LuckyDrawCampaignRow[]>([]);
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formState, setFormState] = useState<CampaignFormState>(createDefaultFormState());
  const [message, setMessage] = useState<string | null>(null);
  const [messageError, setMessageError] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const response = await fetch(
      `/api/admin/lucky-draw-campaigns?restaurantId=${encodeURIComponent(restaurantId)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setMessageError(true);
      setMessage(payload.error ?? "Unable to load lucky draw campaigns.");
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { data?: LuckyDrawCampaignRow[] };
    setCampaigns(payload.data ?? []);
    setMessage(null);
    setMessageError(false);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const queryMatched =
        query.trim().length === 0 ||
        campaign.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        (campaign.description ?? "").toLowerCase().includes(query.trim().toLowerCase());

      const filterMatched = filterValue === "all" || campaign.status === filterValue;
      return queryMatched && filterMatched;
    });
  }, [campaigns, filterValue, query]);

  const summary = useMemo<DashboardMetric[]>(() => {
    const now = Date.now();
    const runningActive = campaigns.filter(
      (campaign) =>
        campaign.status === "active" &&
        now >= new Date(campaign.starts_at).getTime() &&
        now <= new Date(campaign.ends_at).getTime()
    ).length;

    const inactiveCount = campaigns.filter((campaign) => campaign.status === "inactive").length;
    const totalEntries = campaigns.reduce((sum, campaign) => sum + campaign.total_entries, 0);
    const avgCost = campaigns.length
      ? Math.round(campaigns.reduce((sum, campaign) => sum + campaign.entry_cost_points, 0) / campaigns.length)
      : 0;

    return [
      { id: "l1", label: "Running Active", value: String(runningActive), delta: "Within active period" },
      { id: "l2", label: "Inactive", value: String(inactiveCount), delta: "Not accepting entries" },
      { id: "l3", label: "Total Entries", value: String(totalEntries), delta: "Across all campaigns" },
      { id: "l4", label: "Avg Entry Cost", value: `${avgCost} pts`, delta: "Points per join" }
    ];
  }, [campaigns]);

  function openCreateDialog() {
    setEditingCampaignId(null);
    setFormState(createDefaultFormState());
    setDialogOpen(true);
  }

  function openEditDialog(campaign: LuckyDrawCampaignRow) {
    setEditingCampaignId(campaign.id);
    setFormState(toFormState(campaign));
    setDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!formState.title.trim()) {
      setMessageError(true);
      setMessage("Campaign title is required.");
      setSaving(false);
      return;
    }

    if (!formState.startsAt || !formState.endsAt) {
      setMessageError(true);
      setMessage("Campaign start/end date is required.");
      setSaving(false);
      return;
    }

    const startsAtIso = toIsoString(formState.startsAt);
    const endsAtIso = toIsoString(formState.endsAt);
    if (new Date(endsAtIso).getTime() <= new Date(startsAtIso).getTime()) {
      setMessageError(true);
      setMessage("End date must be later than start date.");
      setSaving(false);
      return;
    }

    const payload = {
      restaurantId,
      title: formState.title.trim(),
      description: formState.description.trim() || null,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      status: formState.status,
      entryCostPoints: Number(formState.entryCostPoints),
      maxEntriesPerMember: Number(formState.maxEntriesPerMember),
      maxTotalEntries: formState.maxTotalEntries.trim() ? Number(formState.maxTotalEntries) : null,
      minMembershipTier: formState.minMembershipTier,
      requiresActiveMembership: formState.requiresActiveMembership
    };

    const endpoint = editingCampaignId
      ? `/api/admin/lucky-draw-campaigns/${editingCampaignId}`
      : "/api/admin/lucky-draw-campaigns";
    const method = editingCampaignId ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const responsePayload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessageError(true);
      setMessage(responsePayload.error ?? "Unable to save campaign.");
      setSaving(false);
      return;
    }

    setMessageError(false);
    setMessage(editingCampaignId ? "Campaign updated." : "Campaign created.");
    setSaving(false);
    setDialogOpen(false);
    await loadCampaigns();
  }

  function handleDelete(campaignId: string) {
    setDeletingCampaignId(campaignId);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingCampaignId) return;
    setDeleting(true);
    const response = await fetch(`/api/admin/lucky-draw-campaigns/${deletingCampaignId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessageError(true);
      setMessage(payload.error ?? "Unable to delete campaign.");
      setDeleting(false);
      return;
    }

    setMessageError(false);
    setMessage("Campaign deleted.");
    setDeleting(false);
    setDeleteDialogOpen(false);
    setDeletingCampaignId(null);
    await loadCampaigns();
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Lucky Draw Campaign Management</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage lucky draw campaigns with participation conditions and limits.
        </p>
      </header>

      <SummaryCards metrics={summary} />

      <ModuleToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search campaign..."
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" }
        ]}
        ctaLabel="Create Campaign"
        onCreate={openCreateDialog}
      />

      {message ? (
        <p className={messageError ? "text-sm text-red-600" : "text-sm text-[#2b8f68]"}>{message}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Period</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Entry Rule</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Total Entries</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{campaign.title}</p>
                  <p className="text-xs text-muted-foreground">{campaign.description ?? "-"}</p>
                </td>
                <td className="px-3 py-2">
                  <p>{new Date(campaign.starts_at).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(campaign.ends_at).toLocaleString()}</p>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={campaign.status === "active" ? "default" : "outline"}>{campaign.status}</Badge>
                </td>
                <td className="px-3 py-2">
                  <p>{campaign.entry_cost_points} pts / entry</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.max_entries_per_member} per member, min {campaign.min_membership_tier}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <p>{campaign.total_entries}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.max_total_entries !== null ? `max ${campaign.max_total_entries}` : "no cap"}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(campaign)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(campaign.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredCampaigns.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                  No campaign matched your search/filter.
                </td>
              </tr>
            ) : null}
            {loading ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                  Loading campaigns...
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {dialogOpen ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 px-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>{editingCampaignId ? "Edit Lucky Draw Campaign" : "Create Lucky Draw Campaign"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="block space-y-1">
                  <span className="text-sm text-muted-foreground">Title</span>
                  <Input
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Campaign title"
                    required
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <Textarea
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Campaign details..."
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Start</span>
                    <Input
                      type="datetime-local"
                      value={formState.startsAt}
                      onChange={(event) => setFormState((prev) => ({ ...prev, startsAt: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">End</span>
                    <Input
                      type="datetime-local"
                      value={formState.endsAt}
                      onChange={(event) => setFormState((prev) => ({ ...prev, endsAt: event.target.value }))}
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Select
                      value={formState.status}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          status: event.target.value as LuckyDrawCampaignStatus
                        }))
                      }
                    >
                      {campaignStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Minimum Tier</span>
                    <Select
                      value={formState.minMembershipTier}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          minMembershipTier: event.target.value as MembershipTier
                        }))
                      }
                    >
                      {membershipTierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Entry Cost</span>
                    <Input
                      type="number"
                      min="0"
                      value={formState.entryCostPoints}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, entryCostPoints: event.target.value }))
                      }
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Max / Member</span>
                    <Input
                      type="number"
                      min="1"
                      value={formState.maxEntriesPerMember}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, maxEntriesPerMember: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm text-muted-foreground">Total Cap</span>
                    <Input
                      type="number"
                      min="1"
                      value={formState.maxTotalEntries}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, maxTotalEntries: event.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={formState.requiresActiveMembership}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        requiresActiveMembership: event.target.checked
                      }))
                    }
                  />
                  Require active membership
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingCampaignId ? "Update Campaign" : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Campaign"
        description="This campaign will be set to inactive and hidden from active lists."
        confirmLabel="Delete Campaign"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deleting) return;
          setDeleteDialogOpen(false);
          setDeletingCampaignId(null);
        }}
      />
    </section>
  );
}
