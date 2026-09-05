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
