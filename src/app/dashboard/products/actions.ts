"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import { parseCents } from "@/lib/money";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
} | null;

function parseStockQuantity(value: string): number | null {
  const trimmed = value.trim();
  // Non-negative integers only — no sign, no decimal point.
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/** Shared validation for both createProduct and updateProduct. */
function readAndValidate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const skuInput = String(formData.get("sku") ?? "").trim();
  const priceInput = String(formData.get("price") ?? "").trim();
  const stockInput = String(formData.get("stock_quantity") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = "Product name is required.";
  }

  const priceCents = parseCents(priceInput);
  if (priceCents === null) {
    fieldErrors.price = "Enter a valid, non-negative price.";
  }

  const stockQuantity = parseStockQuantity(stockInput);
  if (stockQuantity === null) {
    fieldErrors.stock_quantity = "Enter a whole, non-negative stock quantity.";
  }

  return {
    name,
    sku: skuInput || null,
    priceCents,
    stockQuantity,
    fieldErrors,
  };
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { name, sku, priceCents, stockQuantity, fieldErrors } =
    readAndValidate(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    business_id: business.id,
    name,
    sku,
    price_cents: priceCents!,
    stock_quantity: stockQuantity!,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Missing product id." };
  }

  const { name, sku, priceCents, stockQuantity, fieldErrors } =
    readAndValidate(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      sku,
      price_cents: priceCents!,
      stock_quantity: stockQuantity!,
    })
    .eq("id", id)
    // Defense in depth: RLS (products_update_members) already scopes this
    // to the caller's own business, but scoping the query explicitly too
    // means a bug in RLS wouldn't be the only thing standing between this
    // update and another tenant's row.
    .eq("business_id", business.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id); // defense in depth, see updateProduct

  revalidatePath("/dashboard/products");
}

export async function toggleActive(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const currentlyActive = formData.get("is_active") === "true";
  if (!id) return;

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ is_active: !currentlyActive })
    .eq("id", id)
    .eq("business_id", business.id); // defense in depth, see updateProduct

  revalidatePath("/dashboard/products");
}
