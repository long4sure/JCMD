import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentBusiness } from "@/lib/get-current-business";
import { getSales } from "@/lib/sales";
import { formatCents } from "@/lib/money";

export default async function SalesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding/business");
  }

  // Single query — each sale already comes back with its items and product
  // names attached (see getSales() in src/lib/sales.ts), no per-row fetch.
  const sales = await getSales(business.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Sales</h1>
        <Link href="/dashboard" className="text-sm text-gray-600 underline">
          ← Back to dashboard
        </Link>
      </div>

      <div className="mb-8">
        <Link
          href="/dashboard/sales/new"
          className="inline-block rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + New sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-gray-600">No sales yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map((sale) => (
            <details
              key={sale.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm">
                <span className="text-gray-600">
                  {new Date(sale.created_at).toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  <span className="ml-2 text-xs text-gray-400">
                    {sale.items.length} item{sale.items.length === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="font-medium text-gray-900">
                  {formatCents(sale.total_cents)}
                </span>
              </summary>

              <div className="mt-3 border-t border-gray-100 pt-3">
                {sale.items.length > 0 ? (
                  <ul className="flex flex-col gap-1 text-sm text-gray-700">
                    {sale.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span>{formatCents(item.line_total_cents)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items found.</p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
