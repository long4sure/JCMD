-- ============================================================================
-- 0004_sales.sql
-- ============================================================================
-- Adds sales and sale_items: recording a completed sale (a "transaction") for
-- a business, plus the line items sold within it.
--
-- TENANT ISOLATION:
-- sales is tenant-scoped by business_id, exactly like every other table in
-- this schema, and reuses the is_member_of() helper defined in
-- 0001_init_schema.sql. sale_items has no business_id column of its own —
-- it's scoped transitively through its parent sale (sale_items.sale_id ->
-- sales.business_id), so its policies use a subquery against sales instead.
--
-- MONEY REPRESENTATION:
-- Same convention as products (0003_products.sql): all money columns are
-- integer centavos. unit_price_cents on a sale_item is a SNAPSHOT of the
-- product's price_cents at the moment of sale — it intentionally does not
-- follow later changes to the product's price, so historical sales stay
-- accurate even if a product's price changes afterward.
--
-- WHY AN ATOMIC record_sale() FUNCTION:
-- A sale touches multiple tables (sales, sale_items, products.stock_quantity)
-- and must either fully succeed or not happen at all — e.g. we never want a
-- sales row inserted without its items, or stock decremented without a sale
-- being recorded. Doing this as a sequence of separate app-code queries risks
-- partial writes if any step fails partway through. record_sale() wraps the
-- whole operation in one plpgsql function, which Postgres already runs as a
-- single transaction: if any step raises, everything the function did is
-- rolled back automatically.
--
-- It's SECURITY DEFINER so it can decrement products.stock_quantity (product
-- pricing/stock isn't something the calling user's own RLS grants a generic
-- write path for from inside a single call) and insert into sales/sale_items
-- on the caller's behalf in one shot. Because SECURITY DEFINER bypasses RLS,
-- the function does its OWN is_member_of() authorization check up front —
-- without that check, any authenticated user could call record_sale() with
-- an arbitrary business_id and record a sale for a business they don't
-- belong to. That explicit check is what keeps this function exactly as safe
-- as the RLS policies it bypasses.
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ── sales ────────────────────────────────────────────────────────────────────
-- One row per completed transaction.
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  total_cents integer not null default 0 check (total_cents >= 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── sale_items ───────────────────────────────────────────────────────────────
-- Line items belonging to a sale. product_id is kept (not cascaded from the
-- product) so a sale's history stays queryable even if the product is later
-- deleted — see the FK note below.
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0), -- snapshot at sale time
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

-- Main access patterns: "all sales for this business" (+ recent-first
-- listing), "all items for this sale", and "all sale_items referencing this
-- product" (e.g. for a future sales-history-per-product view).
create index if not exists sales_business_id_idx on public.sales(business_id);
create index if not exists sales_created_at_idx on public.sales(created_at);
create index if not exists sale_items_sale_id_idx on public.sale_items(sale_id);
create index if not exists sale_items_product_id_idx on public.sale_items(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

-- ── sales policies ───────────────────────────────────────────────────────────
-- Members of the owning business can read/write its sales, same as products.

create policy "sales_select_members"
  on public.sales
  for select
  using (is_member_of(business_id));

create policy "sales_insert_members"
  on public.sales
  for insert
  with check (is_member_of(business_id));

create policy "sales_update_members"
  on public.sales
  for update
  using (is_member_of(business_id))
  with check (is_member_of(business_id));

create policy "sales_delete_members"
  on public.sales
  for delete
  using (is_member_of(business_id));

-- ── sale_items policies ──────────────────────────────────────────────────────
-- sale_items has no business_id of its own, so each policy scopes through
-- the parent sale: is this item's sale one that belongs to a business the
-- current user is a member of?

create policy "sale_items_select_members"
  on public.sale_items
  for select
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and is_member_of(s.business_id)
    )
  );

create policy "sale_items_insert_members"
  on public.sale_items
  for insert
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and is_member_of(s.business_id)
    )
  );

create policy "sale_items_update_members"
  on public.sale_items
  for update
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and is_member_of(s.business_id)
    )
  )
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and is_member_of(s.business_id)
    )
  );

create policy "sale_items_delete_members"
  on public.sale_items
  for delete
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and is_member_of(s.business_id)
    )
  );

-- ============================================================================
-- ATOMIC SALE FUNCTION
-- ============================================================================

-- record_sale(business_id, items): records one full transaction — the sale,
-- its line items, and the resulting stock decrements — as a single atomic
-- operation. p_items is a jsonb array of {"product_id": uuid, "quantity": int}.
--
-- Overselling policy: this function BLOCKS a sale if any item's requested
-- quantity exceeds the product's current stock_quantity, raising an
-- exception naming the offending product. We'd rather a sale fail loudly and
-- get retried than silently let stock go negative.
create or replace function public.record_sale(p_business_id uuid, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total_cents integer := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_product record;
  v_line_total_cents integer;
begin
  -- Authorization check: security definer bypasses RLS, so we must verify
  -- membership ourselves before touching anything. Without this, any
  -- authenticated user could record a sale (and move stock) for a business
  -- they don't belong to.
  if not public.is_member_of(p_business_id) then
    raise exception 'Not a member of this business';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'A sale must have at least one item';
  end if;

  -- Create the sale row first (total_cents is corrected below once all
  -- line items are computed).
  insert into public.sales (business_id, created_by, total_cents)
  values (p_business_id, auth.uid(), 0)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %', v_product_id;
    end if;

    -- Lock the product row for the duration of this transaction so
    -- concurrent sales can't both read the same stock_quantity and both
    -- succeed, overselling stock between them.
    select * into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id
    for update;

    if not found then
      raise exception 'Product % not found for this business', v_product_id;
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'Insufficient stock for product "%": requested %, available %',
        v_product.name, v_quantity, v_product.stock_quantity;
    end if;

    v_line_total_cents := v_product.price_cents * v_quantity;
    v_total_cents := v_total_cents + v_line_total_cents;

    insert into public.sale_items (
      sale_id, product_id, quantity, unit_price_cents, line_total_cents
    ) values (
      v_sale_id, v_product_id, v_quantity, v_product.price_cents, v_line_total_cents
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product_id;
  end loop;

  update public.sales
  set total_cents = v_total_cents
  where id = v_sale_id;

  return v_sale_id;
end;
$$;
