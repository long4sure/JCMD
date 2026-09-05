-- ============================================================================
-- 0002_triggers.sql
-- ============================================================================
-- Enforces two invariants that 0001_init_schema.sql leaves possible to violate:
--   1. Every auth user has a matching public.profiles row.
--   2. Every business has an 'owner' membership row for its creator.
--
-- WHY TRIGGERS, NOT APP CODE:
-- If these were left to application code (e.g. "after sign up, also insert a
-- profile row" in a route handler), any code path that skips that step — a
-- bug, a different sign-up flow, a direct API call, a future admin tool —
-- would silently leave the invariant broken. A trigger lives on the table
-- itself, so it runs no matter *how* the row was inserted, and it can't be
-- forgotten by a future contributor writing new sign-up or business-creation
-- code.
--
-- This also closes a real RLS lockout gap: businesses' RLS policies (see
-- 0001) gate select/update access through is_member_of(id), which checks for
-- a memberships row. Without a trigger, a business is inserted (allowed,
-- because the insert policy only checks owner_id = auth.uid()) but the
-- creator would have NO membership row yet — meaning they could create a
-- business and then immediately be unable to see it, since select requires
-- is_member_of(). The trigger inserts that membership row atomically as part
-- of the same insert, so the gap never opens.
-- ============================================================================

-- ============================================================================
-- 1. New auth user → profile row
-- ============================================================================

-- security definer: this function must be able to insert into public.profiles
-- on behalf of a brand-new user before that user has any session/JWT of their
-- own to satisfy the profiles RLS policies with. set search_path = public
-- pins name resolution so the function can't be hijacked by a search_path
-- change.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing; -- idempotent, never fails a signup

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. New business → owner membership row
-- ============================================================================

-- Same security definer reasoning as above: the inserting user's session can
-- satisfy businesses' insert policy (owner_id = auth.uid()), but they have no
-- membership row yet to satisfy memberships' own RLS policies — this function
-- creates that row on their behalf, in the same transaction as the insert.
create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.memberships (business_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (business_id, user_id) do nothing; -- idempotent

  return new;
end;
$$;

drop trigger if exists on_business_created on public.businesses;

create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();
