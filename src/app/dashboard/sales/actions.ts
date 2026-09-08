"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";

export type SaleItemInput = {
  product_id: string;
  quantity: number;
};

export type RecordSaleResult = { saleId: string } | { error: string };

/**
 * Records a full sale (line items + stock decrements) atomically via the
 * record_sale() database function (see supabase/migrations/0004_sales.sql).
 * All business-rule validation — membership, product ownership, sufficient
 * stock — happens inside that function, which raises clear, user-facing
 * error messages we surface directly below rather than re-deriving them
 * here.
 */
export async function recordSale(
  items: SaleItemInput[]
): Promise<RecordSaleResult> {
  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/login");
  }

  if (!items || items.length === 0) {
    return { error: "Add at least one product to the sale." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_sale", {
    p_business_id: business.id,
    p_items: items,
  });

  if (error || !data) {
    return { error: error?.message ?? "Could not record the sale." };
  }

  // Stock changed (products), a new sale exists (sales), and the dashboard
  // may show stats derived from either later — revalidate all three.
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");

  return { saleId: data };
}
