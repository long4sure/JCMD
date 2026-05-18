-- ============================================================
-- BizDemo — Supabase Schema for all 3 demos
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Uses Supabase Auth (built-in) — no custom users table needed
-- ============================================================

-- ══════════════════════════════════════════════
-- 1. COFFEE SHOP (BrewBooks)
-- ══════════════════════════════════════════════

create table if not exists public.coffee_inventory (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      text,
  stock         numeric default 0,
  unit          text default 'pcs',
  min_stock     numeric default 0,
  selling_price numeric default 0,
  cost_price    numeric default 0,
  show_in_pos   boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.coffee_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  date        date not null default current_date,
  amount      numeric default 0,
  category    text,
  payee       text,
  status      text default 'Paid',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.coffee_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text default 'Supplier',
  category   text,
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

create table if not exists public.coffee_sales (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  items      text,
  total      numeric default 0,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 2. KARINDERYA / FAST FOOD (KarindERP)
-- ══════════════════════════════════════════════

create table if not exists public.kd_menu (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      text,
  stock         numeric default 0,
  selling_price numeric default 0,
  cost_price    numeric default 0,
  show_in_pos   boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.kd_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  date        date not null default current_date,
  amount      numeric default 0,
  category    text,
  payee       text,
  status      text default 'Paid',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.kd_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text default 'Supplier',
  category   text,
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

create table if not exists public.kd_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  items         text,
  total         numeric default 0,
  customer_name text,
  created_at    timestamptz default now()
);

-- ══════════════════════════════════════════════
-- 3. GENERAL STORE / SARI-SARI (StoreERP)
-- ══════════════════════════════════════════════

create table if not exists public.store_inventory (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  category   text,
  stock      numeric default 0,
  unit       text default 'pcs',
  min_stock  numeric default 0,
  buy_price  numeric default 0,
  sell_price numeric default 0,
  supplier   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.store_purchases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  date         date not null default current_date,
  supplier     text,
  qty          numeric default 0,
  unit_cost    numeric default 0,
  status       text default 'Received',
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.store_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  date        date not null default current_date,
  amount      numeric default 0,
  category    text,
  payee       text,
  status      text default 'Paid',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.store_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text default 'Supplier',
  category   text,
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════

create index if not exists idx_coffee_inv_user   on public.coffee_inventory(user_id);
create index if not exists idx_coffee_exp_user   on public.coffee_expenses(user_id);
create index if not exists idx_coffee_con_user   on public.coffee_contacts(user_id);
create index if not exists idx_coffee_sales_user on public.coffee_sales(user_id);

create index if not exists idx_kd_menu_user      on public.kd_menu(user_id);
create index if not exists idx_kd_exp_user       on public.kd_expenses(user_id);
create index if not exists idx_kd_con_user       on public.kd_contacts(user_id);
create index if not exists idx_kd_orders_user    on public.kd_orders(user_id);

create index if not exists idx_store_inv_user    on public.store_inventory(user_id);
create index if not exists idx_store_po_user     on public.store_purchases(user_id);
create index if not exists idx_store_exp_user    on public.store_expenses(user_id);
create index if not exists idx_store_con_user    on public.store_contacts(user_id);

-- ══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Users only see their own data
-- ══════════════════════════════════════════════

alter table public.coffee_inventory enable row level security;
alter table public.coffee_expenses  enable row level security;
alter table public.coffee_contacts  enable row level security;
alter table public.coffee_sales     enable row level security;

alter table public.kd_menu      enable row level security;
alter table public.kd_expenses  enable row level security;
alter table public.kd_contacts  enable row level security;
alter table public.kd_orders    enable row level security;

alter table public.store_inventory enable row level security;
alter table public.store_purchases enable row level security;
alter table public.store_expenses  enable row level security;
alter table public.store_contacts  enable row level security;

-- RLS Policies
do $$ declare t text;
begin
  foreach t in array array[
    'coffee_inventory','coffee_expenses','coffee_contacts','coffee_sales',
    'kd_menu','kd_expenses','kd_contacts','kd_orders',
    'store_inventory','store_purchases','store_expenses','store_contacts'
  ] loop
    execute format('
      create policy if not exists "users_own_%s"
      on public.%s for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    ', t, t);
  end loop;
end $$;
