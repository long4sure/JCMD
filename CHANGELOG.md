# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Migrated project foundation from a static HTML site to Next.js (App Router, TypeScript, Tailwind CSS).

### Added
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) and Resend client dependencies.
- MIT license.
- Open-source project documentation: README, CONTRIBUTING, CODE_OF_CONDUCT.
- CHANGELOG, pull request template, and issue templates.
- Env var structure documented via `.env.example` (secrets kept in gitignored `.env.local`).
- Multi-tenant database schema (`profiles`, `businesses`, `memberships`) with
  Row Level Security enabled on every table, scoping access to a user's own
  data and the businesses they're a member of.
- `is_member_of()` security-definer helper function to keep RLS policies
  simple and avoid policy recursion.
- Database triggers to auto-create a `profiles` row on signup and an owner
  `memberships` row on business creation, enforcing both invariants at the
  database level regardless of app code path.
- `@supabase/ssr` browser and server client wiring, plus session-refresh
  middleware, for the Next.js App Router.
- Authentication: signup, login, and logout via Supabase Auth server actions.
- Email verification flow: confirmation email sent via Resend, handled by an
  `/auth/callback` route that exchanges the code for a session.
- `/verify` check-your-email screen shown after signup.
- Business onboarding: business-type config plus a two-step flow that creates
  a business (and its owner membership) after email verification.
- `getCurrentBusiness()` helper to look up the signed-in user's business,
  scoped entirely by RLS — no service role key involved.
- Route protection: signed-out users are redirected to `/login`, and
  `/dashboard` redirects users with no business yet to onboarding.
- Generate typed Supabase client and remove unsafe cast.
- Products management (sales core): `products` table with business-scoped RLS
  and a reusable `set_updated_at()` trigger; prices stored as integer
  centavos.
- Products page with add/edit/delete/activate-toggle UI and an empty state,
  backed by typed `getProducts()` and CRUD server actions.
- `money.ts` (`formatCents`/`parseCents`) for exact currency handling
  throughout the app.
- Full landing page replacing the starter homepage: animated dark hero
  (aurora/orb motion), business-type showcase, features, how-it-works, and a
  final CTA.
- Privacy Policy (`/privacy`) and Terms of Service (`/terms`), each with a
  clear "not legal advice" disclaimer.
- Scroll-reveal and hover motion across the landing page, entirely gated
  behind `prefers-reduced-motion` for accessibility.
- Acknowledgment section crediting the free/open tools (Next.js, Supabase,
  Resend, Vercel, Tailwind CSS) and AI pair-programming (Claude, ChatGPT)
  used to build JCMD.
- Restored the JCMD logo to `public/` and set site metadata (title,
  description).
- `@tabler/icons-react` for iconography.
- Rebranded the product to Sagot: JCMD is now retained only as the "made by"
  footer credit (and in the unchanged GitHub repo URLs), with all wordmarks,
  headings, copy, metadata, and legal-page prose updated to Sagot.
- Limitations & Transparency page (`/limitations`) explaining the free-tier
  constraints Sagot runs on (database, email, hosting) in plain, honest
  terms, with a landing-page transparency note and a cross-link from Terms.
- Sales/transactions: `sales` and `sale_items` tables with tenant-scoped RLS,
  and an atomic `record_sale()` database function that row-locks products,
  blocks overselling, snapshots unit price at sale time, and decrements
  stock — all in one transaction.
- New Sale cart UI (stock-aware quantity inputs, running total), a sales
  history page with expandable line items, and a Sales nav link on the
  dashboard.
- Real dashboard: `get_dashboard_stats()` aggregates today/week/all-time
  revenue and sales counts, low-stock products, top sellers, and a 7-day
  revenue series in a single SECURITY DEFINER, member-checked database call,
  rendered as stat cards, an amber 7-day bar chart, a low-stock list, and a
  top-products list.
- Shared dashboard app chrome: a responsive layout with a collapsible sidebar
  and top bar, white-labeled with the signed-in business's own name (Sagot
  stays a small "powered by" credit, not the primary brand), active-route
  highlighting, and disabled "Soon" nav items for Inventory/Staff/Settings.

### Performance
- Wrapped `getCurrentUser()`/`getCurrentBusiness()` in React `cache()` so
  each fires at most once per request, parameterized data helpers
  (`getProducts()`, `getSales()`) with an optional `businessId` to avoid
  re-deriving it, and replaced the sales list's per-row N+1 query with a
  single embedded bulk query — cutting the sales page from as many as ~156
  Supabase round trips down to 3.
