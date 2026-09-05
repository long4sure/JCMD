"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, updateProduct, type ProductFormState } from "./actions";
import type { Product } from "@/lib/products";

const initialState: ProductFormState = null;

/**
 * Shared form for both adding a new product (no `product` prop) and editing
 * an existing one (`product` passed in) — the only difference is which
 * server action it's wired to and whether fields start pre-filled.
 */
export default function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateProduct : createProduct,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fieldId = product?.id ?? "new";

  // Clear the "add product" form after a successful create so it's ready
  // for the next entry. Editing keeps its values, since the row stays open.
  useEffect(() => {
    if (state?.success && !isEdit) {
      formRef.current?.reset();
    }
  }, [state, isEdit]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`name-${fieldId}`}
          className="text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id={`name-${fieldId}`}
          name="name"
          type="text"
          defaultValue={product?.name ?? ""}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`sku-${fieldId}`}
          className="text-sm font-medium text-gray-700"
        >
          SKU (optional)
        </label>
        <input
          id={`sku-${fieldId}`}
          name="sku"
          type="text"
          defaultValue={product?.sku ?? ""}
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor={`price-${fieldId}`}
            className="text-sm font-medium text-gray-700"
          >
            Price (₱)
          </label>
          <input
            id={`price-${fieldId}`}
            name="price"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          {state?.fieldErrors?.price && (
            <p className="text-sm text-red-600">{state.fieldErrors.price}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor={`stock-${fieldId}`}
            className="text-sm font-medium text-gray-700"
          >
            Stock
          </label>
          <input
            id={`stock-${fieldId}`}
            name="stock_quantity"
            type="text"
            inputMode="numeric"
            defaultValue={product ? String(product.stock_quantity) : "0"}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          {state?.fieldErrors?.stock_quantity && (
            <p className="text-sm text-red-600">
              {state.fieldErrors.stock_quantity}
            </p>
          )}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          {isEdit ? "Product updated." : "Product added."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending
          ? isEdit
            ? "Saving…"
            : "Adding…"
          : isEdit
            ? "Save changes"
            : "Add product"}
      </button>
    </form>
  );
}
