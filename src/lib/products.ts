import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import type { Tables } from "@/lib/database.types";

export type Product = Tables<"products">;

/**
 * Returns the current business's products, newest first. Pass `businessId`
 * when the caller already resolved it (e.g. via the cached
 * getCurrentBusiness() in a page's own auth guard) so this doesn't re-derive
 * it; omitted, this falls back to the cached getCurrentBusiness() itself, so
 * callers without it still work — with cache() in place either way costs at
 * most one membership lookup per request. Relies entirely on RLS (the
 * products_select_members policy — see supabase/migrations/0003_products.sql)
 * to scope the query; no service role key is used here. Returns [] if
 * there's no signed-in user or no business yet, rather than throwing.
 */
export async function getProducts(businessId?: string): Promise<Product[]> {
  const resolvedBusinessId = businessId ?? (await getCurrentBusiness())?.id;
  if (!resolvedBusinessId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", resolvedBusinessId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
