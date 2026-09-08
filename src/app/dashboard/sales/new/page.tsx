import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentBusiness } from "@/lib/get-current-business";
import { getProducts } from "@/lib/products";
import SaleForm from "./sale-form";

export default async function NewSalePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding/business");
  }

  const products = await getProducts(business.id);
  const activeProducts = products.filter((product) => product.is_active);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">New sale</h1>

      <SaleForm products={activeProducts} />
    </div>
  );
}
