"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminBroadcastHistory } from "@/lib/mock/admin";

interface BroadcastHistory {
  id: string;
  title: string;
  message: string;
  total_subscribers: number;
  total_sent: number;
  total_failed: number;
  created_at: string;
}

interface PromotionBroadcastPanelProps {
  restaurantId: string | null;
  mode?: "mock" | "live";
  canBroadcast?: boolean;
}

export function PromotionBroadcastPanel({
  restaurantId,
  mode = "mock",
  canBroadcast = true
}: PromotionBroadcastPanelProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/promotions");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [totalRows, setTotalRows] = useState(0);

  const loadHistory = useCallback(async () => {
    if (mode === "mock") {
      const mapped = adminBroadcastHistory.map((row) => ({
        id: row.id,
        title: row.title,
        message: "Mock broadcast message",
        total_subscribers: Number(row.total_subscribers),
        total_sent: Number(row.total_sent),
        total_failed: Number(row.total_failed),
        created_at: row.created_at
      }));
      const filtered = mapped.filter((item) => {
        if (!query.trim()) return true;
        const text = query.trim().toLowerCase();
        return item.title.toLowerCase().includes(text) || item.message.toLowerCase().includes(text);
      });

      const sorted = [...filtered].sort((left, right) => {
        const leftTime = new Date(left.created_at).getTime();
        const rightTime = new Date(right.created_at).getTime();
        return sortOrder === "asc" ? leftTime - rightTime : rightTime - leftTime;
      });

      const start = (page - 1) * pageSize;
      setHistory(sorted.slice(start, start + pageSize));
      setTotalRows(sorted.length);
      return;
    }

    if (!restaurantId) {
      setHistory([]);
      setTotalRows(0);
      return;
    }
    const params = new URLSearchParams({
      restaurantId,
      page: String(page),
      pageSize: String(pageSize),
      sortOrder
    });
    if (query.trim()) params.set("query", query.trim());

    const response = await fetch(`/api/notifications/history?${params.toString()}`);
    if (!response.ok) return;
    const data = (await response.json()) as { data: BroadcastHistory[]; total?: number };
    setHistory(data.data ?? []);
    setTotalRows(typeof data.total === "number" ? data.total : (data.data ?? []).length);
  }, [mode, page, pageSize, query, restaurantId, sortOrder]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, query, sortOrder]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canBroadcast) {
      setStatusMessage("Your role can view history but cannot broadcast promotions.");
      return;
    }

    if (mode === "mock") {
      setLoading(true);
      setStatusMessage(null);
      const newItem: BroadcastHistory = {
        id: `mock-${Date.now()}`,
        title,
        message,
        total_subscribers: 1500,
        total_sent: 1450,
        total_failed: 50,
        created_at: new Date().toISOString()
      };
      setHistory((prev) => [newItem, ...prev]);
      setStatusMessage("Mock broadcast queued successfully.");
      setTitle("");
      setMessage("");
      setUrl("/promotions");
      setLoading(false);
      setPage(1);
      return;
    }

    if (!restaurantId) {
      setStatusMessage("No restaurant context found for this admin account.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const response = await fetch("/api/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        title,
        message,
        url
      })
    });

    const responseData = (await response.json()) as { error?: string; sent?: number; failed?: number };
    if (!response.ok) {
      setStatusMessage(responseData.error ?? "Broadcast failed.");
      setLoading(false);
      return;
    }

    setStatusMessage(`Broadcast sent: ${responseData.sent ?? 0} success, ${responseData.failed ?? 0} failed`);
    setTitle("");
    setMessage("");
    setUrl("/promotions");
    setLoading(false);
    setPage(1);
    await loadHistory();
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const rowStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rowEnd = totalRows === 0 ? 0 : Math.min(page * pageSize, totalRows);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
      <header>
        <h3 className="text-lg font-semibold">Push Broadcast (Chrome PWA)</h3>
        <p className="text-sm text-muted-foreground">
          Send promotion notifications to subscribed users and keep delivery history.
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" required />
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Promotion message..."
          required
        />
        <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/promotions" />
        <Button type="submit" disabled={loading || (mode === "live" && !restaurantId) || !canBroadcast}>
          {loading ? "Broadcasting..." : "Broadcast Promotion"}
        </Button>
      </form>

      {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search history..."
          className="sm:max-w-xs"
        />
        <Select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value === "asc" ? "asc" : "desc")}
          className="sm:max-w-[180px]"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Subscribers</th>
              <th className="px-3 py-2 text-left">Sent</th>
              <th className="px-3 py-2 text-left">Failed</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{item.total_subscribers}</td>
                <td className="px-3 py-2">{item.total_sent}</td>
                <td className="px-3 py-2">{item.total_failed}</td>
                <td className="px-3 py-2">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!history.length ? (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                  No broadcast history yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
        <p className="text-muted-foreground">
          Showing {rowStart}-{rowEnd} of {totalRows}
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-9 w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={page <= 1}>
            First
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPage((prev) => prev - 1)} disabled={page <= 1}>
            Prev
          </Button>
          <span className="min-w-16 text-center text-muted-foreground">
            {page}/{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
            Last
          </Button>
        </div>
      </div>
    </section>
  );
}
