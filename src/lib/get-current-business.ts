import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type CurrentBusiness = {
  id: string;
  name: string;
  business_type: string;
  owner_id: string;
};

/**
 * Returns the current signed-in user, or null.
 *
 * Wrapped in React's cache() so that no matter how many places in a single
 * request call this — a page's own guard, getCurrentBusiness() below, a data
 * helper — the underlying supabase.auth.getUser() call fires at most once
 * per request. This matters because getUser() (unlike the cheaper, purely
 * local getSession()) always makes a real network request to the Supabase
 * Auth server to revalidate the token, so every redundant call used to be a
 * real round trip, not just a cheap function call.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Returns the current user's business, or null if they're signed out or
 * haven't created one yet. Looks it up via their membership row rather than
 * querying `businesses` directly, matching how tenancy is modeled in the
 * schema (see supabase/migrations/0001_init_schema.sql).
 *
 * Deliberately relies on RLS to scope this query — no service role key is
 * used here, so this can never accidentally return another tenant's data.
 *
 * Wrapped in React's cache() for the same reason as getCurrentUser() above —
 * multiple pages and data helpers (getProducts, getSales, ...) used to each
 * call this independently per request; cache() dedupes all of those down to
 * a single membership lookup.
 */
export const getCurrentBusiness = cache(
  async (): Promise<CurrentBusiness | null> => {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("business:businesses(id, name, business_type, owner_id)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // The generated types can't express that memberships.business_id ->
    // businesses.id is a to-one relationship, so `business` is typed as an
    // array even though it's always a single row (or null) at runtime.
    // Normalize the shape rather than casting the type away.
    const business = Array.isArray(data.business)
      ? data.business[0]
      : data.business;

    return business ?? null;
  }
);
