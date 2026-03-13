import type { DashboardMetric } from "@/lib/mock/admin";

interface SummaryCardsProps {
  metrics: DashboardMetric[];
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.id} className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{metric.value}</p>
          <p className="mt-1 text-xs font-medium text-[#2b8f68]">{metric.delta}</p>
        </article>
      ))}
    </section>
  );
}

