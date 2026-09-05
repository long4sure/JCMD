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
