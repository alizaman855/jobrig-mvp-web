import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Briefcase, DollarSign, FileSignature, MessageSquareText } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { startOfWeek, addDays, startOfMonth, addMonths } from "@/lib/date-ranges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart";

export const metadata: Metadata = { title: "Dashboard — Jobrig" };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const weekLabelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const CHART_WEEKS = 8;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { error } = await searchParams;

  // Revenue/quote/review figures aren't appropriate for TECH to see (same
  // level of financial visibility as the rest of the app — Invoices,
  // Settings, Team are all owner/dispatcher-or-owner already). My Jobs is
  // their real home.
  if (user.role === "TECH") {
    redirect("/dashboard/my-jobs");
  }

  const db = forTenant({ businessId: user.businessId });

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(now);
  const monthEnd = addMonths(monthStart, 1);
  const chartStart = addDays(weekStart, -7 * (CHART_WEEKS - 1));

  // Four stat-tile queries run as real SQL COUNT/SUM, not fetch-then-count
  // in JS — each is scoped to this business (indexed) and to a week/month
  // range (also indexed as of this phase), so at the data volume a single
  // field-service business actually produces (tens to low hundreds of rows
  // a month), these are cheap regardless of caching. See the chart section
  // below for why the 8-week chart is 2 queries, not 16.
  const [jobsThisWeek, quotesPendingSignature, revenueThisMonth, reviewRequestsSentThisMonth, chartJobs, chartInvoices] =
    await Promise.all([
      db.job.count({ scheduledAt: { gte: weekStart, lt: weekEnd } }),
      db.quote.count({ status: "SENT" }),
      db.invoice.sumTotal({ status: "PAID", paidAt: { gte: monthStart, lt: monthEnd } }),
      db.reviewRequest.count({ sentAt: { gte: monthStart, lt: monthEnd } }),
      db.job.findMany({
        where: { scheduledAt: { gte: chartStart, lt: weekEnd } },
        select: { scheduledAt: true },
      }),
      db.invoice.findMany({
        where: { status: "PAID", paidAt: { gte: chartStart, lt: weekEnd } },
        select: { paidAt: true, total: true },
      }),
    ]);

  const weekBuckets = Array.from({ length: CHART_WEEKS }, (_, i) => {
    const start = addDays(chartStart, i * 7);
    const end = addDays(start, 7);
    return { start, end, label: weekLabelFormatter.format(start) };
  });

  const jobsChartData = weekBuckets.map((bucket) => {
    const count = chartJobs.filter(
      (j) => j.scheduledAt && j.scheduledAt >= bucket.start && j.scheduledAt < bucket.end
    ).length;
    return { label: bucket.label, value: count, tooltip: `${bucket.label}: ${count} job${count === 1 ? "" : "s"}` };
  });

  const revenueChartData = weekBuckets.map((bucket) => {
    const total = chartInvoices
      .filter((inv) => inv.paidAt && inv.paidAt >= bucket.start && inv.paidAt < bucket.end)
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    return { label: bucket.label, value: total, tooltip: `${bucket.label}: ${currency.format(total)}` };
  });

  return (
    <div className="flex flex-col gap-4">
      {error === "forbidden" ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          You don&apos;t have access to that page.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Jobs this week" value={String(jobsThisWeek)} icon={Briefcase} />
        <StatTile
          label="Quotes pending signature"
          value={String(quotesPendingSignature)}
          icon={FileSignature}
        />
        <StatTile
          label="Revenue this month"
          value={currency.format(Number(revenueThisMonth))}
          icon={DollarSign}
        />
        <StatTile
          label="Review requests sent"
          value={String(reviewRequestsSentThisMonth)}
          icon={MessageSquareText}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Jobs per week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart data={jobsChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue per week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart data={revenueChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
