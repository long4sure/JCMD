-- ============================================================================
-- 0001_init_schema.sql
-- ============================================================================
-- JCMD multi-tenant core schema: profiles, businesses, memberships.
--
-- WHY ROW LEVEL SECURITY (RLS):
-- This migration enables RLS on every table and defines policies that scope
-- every read/write to rows the current authenticated user (auth.uid()) is
-- actually allowed to touch. This means tenant isolation is enforced by the
-- DATABASE itself, at the Postgres level — NOT by application code. Even if
-- a bug, a compromised API route, or a malicious client sent a query for
-- another business's data, Postgres would refuse to return or modify rows
-- outside what the policies allow. App code (including bugs in it) can never
-- bypass this without deliberately using the service_role key server-side.
-- ============================================================================

-- ── EXTENSIONS ───────────────────────────────────────────────────────────────
-- gen_random_uuid() lives in pgcrypto on older Postgres; on Supabase it's
-- usually available already, but this makes the migration self-contained.
create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth user, holding app-level profile data. 1:1 with auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- ── businesses ───────────────────────────────────────────────────────────────
-- One row per tenant ("business"). owner_id is the user who created it.
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── memberships ──────────────────────────────────────────────────────────────
-- Join table: which users belong to which businesses, and their role.
-- This is the table that actually defines tenant access — a user can only
-- act on a business if a membership row for them exists (or they're the owner).
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

-- Indexes to keep membership lookups (by user, and by business) fast — these
-- are exactly the two access patterns the RLS policies below rely on.
create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_business_id_idx on public.memberships(business_id);

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================

-- is_member_of(bid): does the current authenticated user (auth.uid()) have a
-- membership row on business `bid`? SECURITY DEFINER so it can read
-- `memberships` on the caller's behalf even though RLS is enabled on that
-- table — the function itself is the only thing allowed to bypass the RLS
-- check here, and it only ever answers a yes/no question scoped to auth.uid(),
-- so it doesn't leak any row data itself.
create or replace function public.is_member_of(bid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.business_id = bid
      and m.user_id = auth.uid()
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.memberships enable row level security;

-- ── profiles policies ────────────────────────────────────────────────────────
-- A user may only see/change their own profile row.

create policy "profiles_select_own"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── businesses policies ──────────────────────────────────────────────────────
-- Members (via is_member_of) can read/update a business. Only the creator
-- (owner_id = auth.uid()) can insert as themselves or delete the business.

create policy "businesses_select_members"
  on public.businesses
  for select
  using (is_member_of(id));

create policy "businesses_insert_owner"
  on public.businesses
  for insert
  with check (owner_id = auth.uid());

create policy "businesses_update_members"
  on public.businesses
  for update
  using (is_member_of(id))
  with check (is_member_of(id));

create policy "businesses_delete_owner"
  on public.businesses
  for delete
  using (owner_id = auth.uid());

-- ── memberships policies ─────────────────────────────────────────────────────
-- A user can see their own membership rows, or any membership row for a
-- business they themselves belong to (so members can see their teammates).
-- Only the business owner can add or remove members; a user may also insert
-- their own membership row (e.g. accepting an invite flow adds user_id = self).

create policy "memberships_select_self_or_business"
  on public.memberships
  for select
  using (
    user_id = auth.uid()
    or is_member_of(business_id)
  );

create policy "memberships_insert_self_or_owner"
  on public.memberships
  for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = auth.uid()
    )
  );

create policy "memberships_delete_owner"
  on public.memberships
  for delete
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = auth.uid()
    )
  );
