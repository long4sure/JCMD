import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import type { Tables } from "@/lib/database.types";

export type Product = Tables<"products">;

/**
 * Returns the current user's business's products, newest first. Relies
 * entirely on RLS (the products_select_members policy — see
 * supabase/migrations/0003_products.sql) to scope the query; no service role
 * key is used here. Returns [] if there's no signed-in user or no business
 * yet, rather than throwing.
 */
export async function getProducts(): Promise<Product[]> {
  const business = await getCurrentBusiness();
  if (!business) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
