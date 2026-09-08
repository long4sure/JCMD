import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentBusiness } from "@/lib/get-current-business";
import { getDashboardStats } from "@/lib/dashboard";
import { formatCents } from "@/lib/money";

/** "2026-09-02" -> "Wed", formatted in UTC to match the day boundaries
 * get_dashboard_stats() itself computes in UTC (see
 * supabase/migrations/0005_dashboard_stats.sql) rather than whatever
 * timezone this happens to render in. */
function formatWeekday(dayIso: string): string {
  const date = new Date(`${dayIso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

function StatCard({
  label,
  revenueCents,
  salesCount,
}: {
  label: string;
  revenueCents: number;
  salesCount: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">
        {formatCents(revenueCents)}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {salesCount} sale{salesCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  // The layout (src/app/dashboard/layout.tsx) already guards this route —
  // these calls are defensive and, thanks to React's cache(), free: they
  // dedupe to the same underlying auth/membership lookup the layout already
  // made this request. business.id is what this page actually needs, for
  // its own stats fetch below.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding/business");
  }

  // One round trip for every stat on this page — see get_dashboard_stats()
  // in supabase/migrations/0005_dashboard_stats.sql.
  const stats = await getDashboardStats(business.id);

  const maxRevenue = Math.max(
    0,
    ...stats.revenue_by_day.map((day) => day.revenue_cents)
  );
  const hasChartData = stats.revenue_by_day.length > 0 && maxRevenue > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Today"
          revenueCents={stats.revenue_today_cents}
          salesCount={stats.sales_count_today}
        />
        <StatCard
          label="This week"
          revenueCents={stats.revenue_week_cents}
          salesCount={stats.sales_count_week}
        />
        <StatCard
          label="All-time"
          revenueCents={stats.revenue_all_cents}
          salesCount={stats.sales_count_all}
        />
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Last 7 days
        </h2>

        {hasChartData ? (
          <div className="flex h-32 items-end gap-2">
            {stats.revenue_by_day.map((day) => {
              const pct = (day.revenue_cents / maxRevenue) * 100;
              // Give a nonzero day a visible sliver even when it's tiny
              // relative to the week's peak, so it doesn't disappear.
              const barPct = day.revenue_cents > 0 ? Math.max(pct, 4) : 0;

              return (
                <div
                  key={day.day}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-amber-400 transition-colors hover:bg-amber-500"
                      style={{ height: `${barPct}%` }}
                      title={formatCents(day.revenue_cents)}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatWeekday(day.day)}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatCents(day.revenue_cents)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No sales in the last 7 days yet.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Low stock
          </h2>
          {stats.low_stock.length === 0 ? (
            <p className="text-sm text-gray-600">All products well stocked.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.low_stock.map((product) => (
                <li key={product.id}>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center justify-between gap-3 text-sm hover:underline"
                  >
                    <span className="text-gray-900">{product.name}</span>
                    <span
                      className={
                        product.stock_quantity === 0
                          ? "shrink-0 font-medium text-red-600"
                          : "shrink-0 text-amber-600"
                      }
                    >
                      {product.stock_quantity === 0
                        ? "Out of stock"
                        : `${product.stock_quantity} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Top products
          </h2>
          {stats.top_products.length === 0 ? (
            <p className="text-sm text-gray-600">No sales yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.top_products.map((product) => (
                <li
                  key={product.product_id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-gray-900">{product.name}</span>
                  <span className="shrink-0 text-gray-500">
                    {product.total_qty} sold · {formatCents(product.total_cents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
