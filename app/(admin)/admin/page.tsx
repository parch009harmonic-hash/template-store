import { SummaryCards } from "@/components/admin/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardMetrics, recentActivities } from "@/lib/mock/admin";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Daily snapshot for operations, marketing, and members.</p>
      </header>

      <SummaryCards metrics={dashboardMetrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <article key={activity.id} className="rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{activity.action}</p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.actor}</p>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shift Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- Peak order window: 12:00 - 13:30 (78 orders)</p>
            <p>- Top performer dish: Truffle Massaman Beef</p>
            <p>- Campaign conversion: 18.4% from in-app push</p>
            <p>- Member registrations today: 21 new members</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

