-- ============================================================================
-- 0003_products.sql
-- ============================================================================
-- Adds the products table: the catalog of sellable items for a business.
--
-- TENANT ISOLATION:
-- Products are tenant-scoped by business_id, exactly like every other table
-- in this schema. RLS is enabled below and reuses the is_member_of() helper
-- function defined in 0001_init_schema.sql, so the same isolation guarantees
-- established there apply here without introducing a new access model: a
-- user can only see or modify products belonging to a business they're a
-- member of.
--
-- MONEY REPRESENTATION:
-- price_cents stores the price as an integer number of centavos (e.g. ₱150.00
-- is stored as 15000). This avoids floating-point rounding issues in prices
-- and totals. Divide by 100 when displaying the price to a user.
-- ============================================================================

-- ============================================================================
-- TABLE
-- ============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  sku text, -- optional stock-keeping unit
  price_cents integer not null default 0 check (price_cents >= 0),
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Main access pattern: "all products for this business".
create index if not exists products_business_id_idx on public.products(business_id);

-- ============================================================================
-- updated_at TRIGGER
-- ============================================================================

-- Reusable across future tables: bumps updated_at on every row update.
-- `create or replace` so later migrations can depend on this same function
-- without redefining it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.products enable row level security;

-- Members of the owning business can read/write its products. There's no
-- separate "owner-only" restriction here (unlike businesses' delete policy)
-- because day-to-day catalog management is expected to be a shared,
-- staff-level operation, not owner-only.

create policy "products_select_members"
  on public.products
  for select
  using (is_member_of(business_id));

create policy "products_insert_members"
  on public.products
  for insert
  with check (is_member_of(business_id));

create policy "products_update_members"
  on public.products
  for update
  using (is_member_of(business_id))
  with check (is_member_of(business_id));

create policy "products_delete_members"
  on public.products
  for delete
  using (is_member_of(business_id));
