import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentBusiness } from "@/lib/get-current-business";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { signOut } from "@/app/(auth)/actions";
import DashboardShell from "./dashboard-shell";

/**
 * Shared chrome for every /dashboard/* route: resolves the signed-in user
 * and their business ONCE here (via the cached getCurrentUser()/
 * getCurrentBusiness() helpers — see src/lib/get-current-business.ts) and
 * redirects before any child page even renders. This is the primary auth
 * gate; child pages may still re-check defensively (several already do, to
 * get `business.id` for their own data fetching) but that costs nothing
 * extra — React's cache() dedupes every one of those calls down to a single
 * underlying auth/membership lookup per request.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding/business");
  }

  const businessTypeLabel =
    BUSINESS_TYPES.find((type) => type.slug === business.business_type)
      ?.label ?? business.business_type;

  return (
    <DashboardShell
      businessName={business.name}
      businessTypeLabel={businessTypeLabel}
      userEmail={user.email ?? ""}
      signOutAction={signOut}
    >
      {children}
    </DashboardShell>
  );
}
