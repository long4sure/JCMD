"use client";

import { useActionState } from "react";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { createBusiness, type CreateBusinessState } from "../actions";

const initialState: CreateBusinessState = null;

export default function BusinessForm() {
  const [state, formAction, pending] = useActionState(
    createBusiness,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Set up your business
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Tell us a bit about your business to get started.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Business name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="business_type"
          className="text-sm font-medium text-gray-700"
        >
          Business type
        </label>
        <select
          id="business_type"
          name="business_type"
          required
          defaultValue=""
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
        >
          <option value="" disabled>
            Select a business type…
          </option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.slug} value={type.slug}>
              {type.label}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.business_type && (
          <p className="text-sm text-red-600">
            {state.fieldErrors.business_type}
          </p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}
