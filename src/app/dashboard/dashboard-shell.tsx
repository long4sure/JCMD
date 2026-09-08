"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/sales", label: "Sales" },
];

// Not links yet — shown so owners can see what's coming, per spec.
const SOON_LINKS = ["Inventory", "Staff", "Settings"];

function isActive(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

/**
 * The app chrome shared by every /dashboard/* page: a top bar (white-labeled
 * with the business's own name — Sagot is the maker, not the brand a
 * signed-in owner sees) plus a left sidebar that's persistent on desktop and
 * collapses behind a hamburger drawer on mobile.
 *
 * A client component only because active-link highlighting needs
 * usePathname() and the mobile drawer needs open/closed state — the actual
 * user/business data and the auth guard live in the server-component layout
 * that renders this (see layout.tsx), which is what keeps this dependency
 *-free and free of any data fetching of its own.
 */
export default function DashboardShell({
  businessName,
  businessTypeLabel,
  userEmail,
  signOutAction,
  children,
}: {
  businessName: string;
  businessTypeLabel: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isSidebarOpen}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            {isSidebarOpen ? (
              <IconX className="h-5 w-5" />
            ) : (
              <IconMenu2 className="h-5 w-5" />
            )}
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-gray-900">
              {businessName}
            </p>
            <p className="truncate text-xs leading-tight text-gray-500">
              {businessTypeLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-gray-500 sm:inline">
            {userEmail}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Mobile drawer scrim */}
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          />
        )}

        {/* SIDEBAR — persistent on desktop, a drawer on mobile */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 mt-14 w-56 shrink-0 transform border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:mt-0 lg:translate-x-0 lg:transition-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex h-[calc(100%-3.5rem)] flex-col justify-between px-3 py-4 lg:h-full">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded px-3 py-2 text-sm font-medium ${
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              {SOON_LINKS.map((label) => (
                <li key={label}>
                  <span className="flex cursor-not-allowed items-center justify-between rounded px-3 py-2 text-sm text-gray-400">
                    {label}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      Soon
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="px-3 text-[11px] text-gray-400">Powered by Sagot</p>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
