import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import type { Tables } from "@/lib/database.types";

export type Sale = Tables<"sales">;
export type SaleItem = Tables<"sale_items">;

/**
 * A sale_item with its product's name resolved for display. Price fields
 * come straight from the sale_item itself (a snapshot taken at sale time —
 * see supabase/migrations/0004_sales.sql), never re-read from the product.
 */
export type SaleLineItem = {
  id: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  productName: string;
};

export type SaleWithItems = Pick<Sale, "id" | "total_cents" | "created_at"> & {
  items: SaleLineItem[];
};

/**
 * Returns the current business's most recent sales (newest first, capped at
 * 50) WITH each sale's line items and product names already attached, in a
 * single query — a single embedded select rather than one query for the
 * list plus one more per sale (the previous implementation's N+1: up to 156
 * round trips for a 50-sale history). RLS still applies to every embedded
 * table (sales_select_members, sale_items_select_members, products' own
 * policy — see supabase/migrations/0004_sales.sql and 0003_products.sql).
 *
 * Pass `businessId` when the caller already resolved it (e.g. via the cached
 * getCurrentBusiness() in a page's own auth guard); omitted, this falls back
 * to the cached getCurrentBusiness() itself. Returns [] if there's no
 * signed-in user or no business yet.
 */
export async function getSales(businessId?: string): Promise<SaleWithItems[]> {
  const resolvedBusinessId = businessId ?? (await getCurrentBusiness())?.id;
  if (!resolvedBusinessId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, total_cents, created_at, sale_items ( id, quantity, unit_price_cents, line_total_cents, products ( name ) )"
    )
    .eq("business_id", resolvedBusinessId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data.map(({ sale_items, ...sale }) => {
    const items: SaleLineItem[] = (sale_items ?? []).map((item) => {
      // Same generated-types quirk as get-current-business.ts: a to-one
      // embed (sale_items.product_id -> products.id) is typed as an array
      // even though it's always a single row here. Normalize, don't cast.
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      return {
        id: item.id,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        line_total_cents: item.line_total_cents,
        productName: product?.name ?? "(deleted product)",
      };
    });

    return { ...sale, items };
  });
}

/**
 * Returns one sale plus its line items (each joined to its product's name),
 * or null if it doesn't exist or doesn't belong to the current business.
 * Not used by the sales list page (see getSales() above) — kept for a
 * future single-sale detail view. RLS-scoped like getSales(); the explicit
 * .eq("business_id", ...) below is defense in depth, matching the pattern in
 * src/app/dashboard/products/actions.ts.
 *
 * Pass `businessId` when the caller already resolved it; omitted, this
 * falls back to the cached getCurrentBusiness() itself.
 */
export async function getSaleWithItems(
  saleId: string,
  businessId?: string
): Promise<SaleWithItems | null> {
  const resolvedBusinessId = businessId ?? (await getCurrentBusiness())?.id;
  if (!resolvedBusinessId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, total_cents, created_at, sale_items ( id, quantity, unit_price_cents, line_total_cents, products ( name ) )"
    )
    .eq("id", saleId)
    .eq("business_id", resolvedBusinessId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const { sale_items, ...sale } = data;

  const items: SaleLineItem[] = (sale_items ?? []).map((item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    return {
      id: item.id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      line_total_cents: item.line_total_cents,
      productName: product?.name ?? "(deleted product)",
    };
  });

  return { ...sale, items };
}
