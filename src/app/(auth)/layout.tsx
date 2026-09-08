import type { ReactNode } from "react";

/**
 * Shared layout for signup/login/verify: a centered card on a plain
 * background. Purely functional for now — real visual design comes later.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <p className="mb-6 text-center text-xl font-bold tracking-tight text-gray-900">
          Sagot
        </p>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
