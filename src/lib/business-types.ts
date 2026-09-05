/**
 * The business types a new tenant can choose during onboarding.
 * `slug` is what gets stored as `businesses.business_type` in the database.
 */
export const BUSINESS_TYPES = [
  { slug: "coffee", label: "Coffee shop" },
  { slug: "restaurant", label: "Restaurant" },
  { slug: "retail", label: "Retail store" },
  { slug: "salon", label: "Salon & beauty" },
  { slug: "services", label: "Services & appointments" },
  { slug: "other", label: "Other" },
] as const;

export type BusinessTypeSlug = (typeof BUSINESS_TYPES)[number]["slug"];
