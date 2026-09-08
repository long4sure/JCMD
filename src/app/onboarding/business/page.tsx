import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import BusinessForm from "./business-form";

export default async function OnboardingBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (business) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <p className="mb-6 text-center text-xl font-bold tracking-tight text-gray-900">
          Sagot
        </p>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <BusinessForm />
        </div>
      </div>
    </div>
  );
}
