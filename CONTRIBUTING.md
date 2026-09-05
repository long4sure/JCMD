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

## Pull request process

1. Keep PRs focused — one feature or fix per PR. Smaller PRs are easier to review and merge quickly.
2. Fill in the PR template completely (summary, what changed, how to test, checklist).
3. Make sure `npm run build` passes locally before requesting review.
4. Target the `rebuild-nextjs` branch, not `main`.
5. Be responsive to review feedback — we'll do our best to review promptly in return.

## Questions?

Open an issue using the appropriate template, and we'll help out.
