import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";

/**
 * Shape of the jsonb object returned by get_dashboard_stats() (see
 * supabase/migrations/0005_dashboard_stats.sql). The database function
 * returns `jsonb`, which is genuinely untyped at the Postgres boundary — the
 * generated types can only say `Json` — so this type is defined by hand here
 * to match the function's actual output exactly, not derived from
 * database.types.ts. If the SQL function's shape ever changes, this type
 * must be updated to match.
 */
export type DashboardStats = {
  revenue_today_cents: number;
  sales_count_today: number;
  revenue_week_cents: number;
  sales_count_week: number;
  revenue_all_cents: number;
  sales_count_all: number;
  low_stock: { id: string; name: string; stock_quantity: number }[];
  top_products: {
    product_id: string;
    name: string;
    total_qty: number;
    total_cents: number;
  }[];
  revenue_by_day: { day: string; revenue_cents: number }[];
};

/** Returned when there's no signed-in user/business, or the RPC call fails,
 * so the dashboard page always has a safe, zeroed shape to render instead of
 * crashing or needing to handle `null` everywhere. */
const EMPTY_STATS: DashboardStats = {
  revenue_today_cents: 0,
  sales_count_today: 0,
  revenue_week_cents: 0,
  sales_count_week: 0,
  revenue_all_cents: 0,
  sales_count_all: 0,
  low_stock: [],
  top_products: [],
  revenue_by_day: [],
};

/**
 * Returns every stat the dashboard needs in one Supabase round trip, via the
 * get_dashboard_stats() database function — see that migration's file header
 * for why this is one aggregating RPC call rather than several queries.
 *
 * Pass `businessId` when the caller already resolved it (e.g. via the cached
 * getCurrentBusiness() in the page's own auth guard); omitted, this falls
 * back to the cached getCurrentBusiness() itself.
 */
export async function getDashboardStats(
  businessId?: string
): Promise<DashboardStats> {
  const resolvedBusinessId = businessId ?? (await getCurrentBusiness())?.id;
  if (!resolvedBusinessId) {
    return EMPTY_STATS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_dashboard_stats", {
    p_business_id: resolvedBusinessId,
  });

  if (error || !data) {
    return EMPTY_STATS;
  }

  // The RPC's return type is `Json` (jsonb is untyped at the DB boundary) —
  // this cast is the one place that bridges it to the real shape defined
  // above, which is kept hand-in-hand with the SQL function itself.
  return data as unknown as DashboardStats;
}
