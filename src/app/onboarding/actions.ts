"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BUSINESS_TYPES, type BusinessTypeSlug } from "@/lib/business-types";

export type CreateBusinessState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const ALLOWED_SLUGS = new Set<string>(BUSINESS_TYPES.map((type) => type.slug));

function isBusinessTypeSlug(value: string): value is BusinessTypeSlug {
  return ALLOWED_SLUGS.has(value);
}

export async function createBusiness(
  _prevState: CreateBusinessState,
  formData: FormData
): Promise<CreateBusinessState> {
  const name = String(formData.get("name") ?? "").trim();
  const businessType = String(formData.get("business_type") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!name) {
    fieldErrors.name = "Business name is required.";
  }
  if (!businessType) {
    fieldErrors.business_type = "Please select a business type.";
  } else if (!isBusinessTypeSlug(businessType)) {
    fieldErrors.business_type = "Please select a valid business type.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("businesses").insert({
    name,
    business_type: businessType,
    owner_id: user.id,
  });
  // Note: we don't insert a membership row here — the on_business_created
  // trigger (supabase/migrations/0002_triggers.sql) creates the owner
  // membership automatically as part of the same insert.

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
