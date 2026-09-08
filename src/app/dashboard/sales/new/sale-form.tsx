"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordSale } from "../actions";
import { formatCents } from "@/lib/money";
import type { Product } from "@/lib/products";

type CartLine = {
  product: Product;
  quantity: number;
};

/**
 * The "New Sale" cart: pick quantities per product, see a running total, and
 * submit the whole thing to recordSale() in one call. Quantities are clamped
 * to each product's current stock_quantity client-side for a responsive UI —
 * record_sale() itself re-checks stock server-side (and locks the row) as
 * the actual source of truth, since stock can change between page load and
 * submit.
 */
export default function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const lines: CartLine[] = useMemo(
    () =>
      products
        .filter((product) => (cart[product.id] ?? 0) > 0)
        .map((product) => ({ product, quantity: cart[product.id]! })),
    [products, cart]
  );

  const totalCents = lines.reduce(
    (sum, line) => sum + line.product.price_cents * line.quantity,
    0
  );

  function setQuantity(product: Product, quantity: number) {
    const clamped = Math.max(
      0,
      Math.min(Math.floor(quantity) || 0, product.stock_quantity)
    );
    setCart((prev) => ({ ...prev, [product.id]: clamped }));
  }

  function handleRecordSale() {
    setError(null);
    const items = lines.map((line) => ({
      product_id: line.product.id,
      quantity: line.quantity,
    }));

    startTransition(async () => {
      const result = await recordSale(items);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/sales");
    });
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No active products to sell yet. Add products first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">In stock</th>
              <th className="px-4 py-3">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const quantity = cart[product.id] ?? 0;
              const outOfStock = product.stock_quantity <= 0;

              return (
                <tr
                  key={product.id}
                  className={outOfStock ? "opacity-50" : undefined}
                >
                  <td className="px-4 py-3 align-top font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {formatCents(product.price_cents)}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {outOfStock ? "Out of stock" : product.stock_quantity}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input
                      type="number"
                      min={0}
                      max={product.stock_quantity}
                      step={1}
                      value={quantity}
                      disabled={outOfStock}
                      onChange={(e) =>
                        setQuantity(product, Number(e.target.value))
                      }
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Sale summary
        </h2>

        {lines.length === 0 ? (
          <p className="mb-4 text-sm text-gray-600">
            Set a quantity above to add products to this sale.
          </p>
        ) : (
          <ul className="mb-4 flex flex-col gap-2 text-sm">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center justify-between text-gray-700"
              >
                <span>
                  {line.product.name} × {line.quantity}
                </span>
                <span>
                  {formatCents(line.product.price_cents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-4 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleRecordSale}
          disabled={isPending || lines.length === 0}
          className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Recording sale…" : "Record sale"}
        </button>
      </div>
    </div>
  );
}
