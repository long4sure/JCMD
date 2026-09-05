import { createClient } from "@/lib/supabase/server";

export type CurrentBusiness = {
  id: string;
  name: string;
  business_type: string;
  owner_id: string;
};

/**
 * Returns the current user's business, or null if they're signed out or
 * haven't created one yet. Looks it up via their membership row rather than
 * querying `businesses` directly, matching how tenancy is modeled in the
 * schema (see supabase/migrations/0001_init_schema.sql).
 *
 * Deliberately relies on RLS to scope this query — no service role key is
 * used here, so this can never accidentally return another tenant's data.
 */
export async function getCurrentBusiness(): Promise<CurrentBusiness | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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
