# Contributing to JCMD

Thanks for your interest in contributing! JCMD is free and open source, and outside contributions are welcome.

By participating in this project, you're expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Local setup

See the [README](README.md#getting-started-locally) for cloning the repo, installing dependencies, and setting up your `.env.local` from `.env.example`.

## Branching model

- **`rebuild-nextjs`** is the long-lived integration branch for the current rebuild. All feature work is merged here first (it will eventually be merged into `main`).
- Create your feature branch **off `rebuild-nextjs`**, named by type:
  - `feat/*` — new features (e.g. `feat/scaffold`, `feat/business-signup`)
  - `fix/*` — bug fixes (e.g. `fix/session-refresh`)
  - `docs/*` — documentation-only changes (e.g. `docs/api-notes`)
- Open your pull request **into `rebuild-nextjs`**, not `main`.

```bash
git checkout rebuild-nextjs
git pull
git checkout -b feat/your-feature-name
```

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add business type selection during onboarding
fix: correct RLS policy blocking cross-tenant reads
docs: update contributing guide with commit conventions
chore: bump supabase-js to latest
```

Common prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

## Regenerating Supabase types

`src/lib/database.types.ts` is generated from the live database schema and is
committed to the repo. When you regenerate it after a migration, **do not**
use PowerShell's `>` redirect — it writes the file as UTF-16 with a BOM,
which is inconsistent with every other (UTF-8) file in this repo and can
cause subtle build/tooling issues.

Instead, either run the command in WSL/bash (plain UTF-8 by default):

```bash
npx --yes supabase@latest gen types typescript --project-id <PROJECT_REF> --schema public > src/lib/database.types.ts
```

or, if you're in PowerShell, force UTF-8 output explicitly:

```powershell
npx --yes supabase@latest gen types typescript --project-id <PROJECT_REF> --schema public | Out-File -Encoding utf8 src/lib/database.types.ts
```

`<PROJECT_REF>` is the subdomain in your Supabase project URL (the part
before `.supabase.co`) — see `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local`.

## Known limitations

**Session-refresh middleware is intentionally omitted.** Next.js's
middleware/proxy convention has been unreliable across the versions we've
tried:

- Next 16.3.4 (the current `latest`) fails to compile a root
  `middleware.ts`/`proxy.ts` at all — the build succeeds, but
  `.next/server/middleware-manifest.json` comes back completely empty
  regardless of filename, export name, or import style. Confirmed reproducible
  with a fully self-contained file (no path-alias imports).
- Next 16.2.10 *does* compile middleware correctly, but hit its own Vercel
  runtime issues in earlier deploys (ESM/CommonJS mismatches, then a path-alias
  resolution failure) before those were fixed by making the file
  self-contained — and by that point the middleware wasn't buying us anything
  essential, so it was dropped rather than carried forward as more surface
  area to debug.

None of this weakens auth: every protected page calls `getUser()` directly and
redirects to `/login` when signed out, and Row Level Security enforces tenant
isolation at the database level regardless of what the app code does. The
middleware only ever did *proactive* session-cookie refresh — a UX nicety, not
a security boundary.

`src/lib/supabase/middleware.ts` (the `updateSession()` helper) is kept in the
repo, unused, so a working middleware/proxy file can be re-added later once
Next.js's compilation issue is resolved upstream — see git history around
commits `aa9ff2c` and `be1469f` for the last known-working self-contained
implementation.

## Pull request process

1. Keep PRs focused — one feature or fix per PR. Smaller PRs are easier to review and merge quickly.
2. Fill in the PR template completely (summary, what changed, how to test, checklist).
3. Make sure `npm run build` passes locally before requesting review.
4. Target the `rebuild-nextjs` branch, not `main`.
5. Be responsive to review feedback — we'll do our best to review promptly in return.

## Questions?

Open an issue using the appropriate template, and we'll help out.
