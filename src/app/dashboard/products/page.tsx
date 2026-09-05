import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/get-current-business";
import { getProducts } from "@/lib/products";
import { formatCents } from "@/lib/money";
import { deleteProduct, toggleActive } from "./actions";
import ProductForm from "./product-form";

export default async function ProductsPage() {
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

  const products = await getProducts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <Link href="/dashboard" className="text-sm text-gray-600 underline">
          ← Back to dashboard
        </Link>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Add product
        </h2>
        <ProductForm />
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">
          No products yet. Add your first product above to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={!product.is_active ? "opacity-50" : undefined}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-gray-500 underline">
                        Edit
                      </summary>
                      <div className="mt-3 max-w-sm">
                        <ProductForm product={product} />
                      </div>
                    </details>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {product.sku ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-900">
                    {formatCents(product.price_cents)}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {product.stock_quantity}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={
                        product.is_active
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      }
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-3">
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={String(product.is_active)}
                        />
                        <button
                          type="submit"
                          className="text-xs text-gray-600 underline"
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
