import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { signOut } from "@/app/(auth)/actions";

// Simple dashboard shell for now — the full dashboard comes in Phase 4.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {business.name}
        </h1>
        <p className="text-sm text-gray-600">{businessTypeLabel}</p>
      </div>

      <p className="text-sm text-gray-600">
        Signed in as{" "}
        <span className="font-medium text-gray-900">{user.email}</span>
      </p>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
