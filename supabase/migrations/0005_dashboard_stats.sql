-- ============================================================================
-- 0005_dashboard_stats.sql
-- ============================================================================
-- Adds get_dashboard_stats(): a single SECURITY DEFINER function that
-- aggregates everything the dashboard needs — today/week/all-time revenue and
-- sales counts, low-stock products, top sellers, and a 7-day revenue series —
-- into one jsonb object, computed entirely in SQL.
--
-- WHY ONE FUNCTION INSTEAD OF SEVERAL QUERIES (OR RAW ROWS) FROM THE APP:
-- The Supabase project is in Seoul; users are expected to mostly be in the
-- Philippines. Every extra round trip pays that distance in latency. Fetching
-- raw sales/sale_items rows and summing them in JS would multiply that cost
-- further still, since it also ships every row over the network instead of
-- just the aggregate. Postgres can compute all of these aggregates from the
-- same underlying rows far more cheaply than the app ever could — this
-- function does all of it server-side and returns exactly one small jsonb
-- payload: one round trip for the whole dashboard, regardless of how much
-- sales history exists.
--
-- SECURITY: SECURITY DEFINER bypasses RLS, so — exactly like record_sale() in
-- 0004_sales.sql — this function does its OWN is_member_of() authorization
-- check up front. Without it, any authenticated user could call this with an
-- arbitrary business_id and read another tenant's stats.
--
-- DAY BOUNDARIES: "today" and "the last 7 days" are computed against UTC day
-- boundaries for v1 (i.e. `now() at time zone 'utc'`), not the business's
-- local timezone — so "today" flips over at 8am Philippine time, not
-- midnight. Fine for v1; localizing this properly would need a per-business
-- timezone setting, which doesn't exist yet.
-- ============================================================================

-- Composite index matching this function's hottest access pattern (today /
-- week / all-time all filter by business_id, two of the three also range on
-- created_at). The existing single-column indexes from 0004_sales.sql
-- already support these queries; this composite index just makes them
-- cheaper as sales history grows.
create index if not exists sales_business_id_created_at_idx
  on public.sales(business_id, created_at);

create or replace function public.get_dashboard_stats(p_business_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_week_start date := v_today - 6; -- 7 days inclusive of today
  v_result jsonb;
begin
  -- Authorization check: security definer bypasses RLS, so we must verify
  -- membership ourselves before reading anything. Without this, any
  -- authenticated user could read another business's stats by passing an
  -- arbitrary business_id.
  if not public.is_member_of(p_business_id) then
    raise exception 'Not a member of this business';
  end if;

  with
  today_agg as (
    select
      coalesce(sum(total_cents), 0)::bigint as revenue_cents,
      count(*) as sales_count
    from public.sales
    where business_id = p_business_id
      and created_at >= (v_today::timestamp at time zone 'utc')
  ),
  week_agg as (
    select
      coalesce(sum(total_cents), 0)::bigint as revenue_cents,
      count(*) as sales_count
    from public.sales
    where business_id = p_business_id
      and created_at >= (v_week_start::timestamp at time zone 'utc')
  ),
  all_agg as (
    select
      coalesce(sum(total_cents), 0)::bigint as revenue_cents,
      count(*) as sales_count
    from public.sales
    where business_id = p_business_id
  ),
  low_stock_rows as (
    -- Active products at or below the low-stock threshold, lowest first.
    select id, name, stock_quantity
    from public.products
    where business_id = p_business_id
      and is_active = true
      and stock_quantity <= 5
    order by stock_quantity asc
    limit 10
  ),
  top_product_rows as (
    -- Best-sellers by total quantity sold, all-time.
    select
      si.product_id,
      p.name,
      sum(si.quantity)::integer as total_qty,
      sum(si.line_total_cents)::bigint as total_cents
    from public.sale_items si
    join public.sales s on s.id = si.sale_id
    join public.products p on p.id = si.product_id
    where s.business_id = p_business_id
    group by si.product_id, p.name
    order by sum(si.quantity) desc
    limit 5
  ),
  day_series as (
    -- One row per day in the last 7 days, so days with zero sales still show
    -- up as 0 in revenue_by_day instead of being missing entirely.
    select d::date as day
    from generate_series(
      v_week_start::timestamp,
      v_today::timestamp,
      interval '1 day'
    ) d
  ),
  revenue_by_day_rows as (
    select
      ds.day,
      coalesce(sum(s.total_cents), 0)::bigint as revenue_cents
    from day_series ds
    left join public.sales s
      on s.business_id = p_business_id
      and s.created_at >= (ds.day::timestamp at time zone 'utc')
      and s.created_at < ((ds.day + 1)::timestamp at time zone 'utc')
    group by ds.day
  )
  select jsonb_build_object(
    'revenue_today_cents', (select revenue_cents from today_agg),
    'sales_count_today', (select sales_count from today_agg),
    'revenue_week_cents', (select revenue_cents from week_agg),
    'sales_count_week', (select sales_count from week_agg),
    'revenue_all_cents', (select revenue_cents from all_agg),
    'sales_count_all', (select sales_count from all_agg),
    'low_stock', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'name', name,
            'stock_quantity', stock_quantity
          )
          order by stock_quantity asc
        )
        from low_stock_rows
      ),
      '[]'::jsonb
    ),
    'top_products', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_id', product_id,
            'name', name,
            'total_qty', total_qty,
            'total_cents', total_cents
          )
          order by total_qty desc
        )
        from top_product_rows
      ),
      '[]'::jsonb
    ),
    'revenue_by_day', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('day', day, 'revenue_cents', revenue_cents)
          order by day asc
        )
        from revenue_by_day_rows
      ),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$$;
