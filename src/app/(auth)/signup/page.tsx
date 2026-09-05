"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "../actions";

const initialState: AuthFormState = null;

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-900">
        Create your account
      </h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {state?.fieldErrors?.fullName && (
          <p className="text-sm text-red-600">{state.fieldErrors.fullName}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {state?.fieldErrors?.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {state?.fieldErrors?.password && (
          <p className="text-sm text-red-600">{state.fieldErrors.password}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
