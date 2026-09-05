# JCMD

A free, open-source, multi-tenant business management platform. **Free and open source (MIT licensed).**

> **Status:** under active rebuild — this project is migrating from a static HTML portfolio site to a full Next.js application. Expect things to move fast and change shape.

---

## What is JCMD

JCMD lets business owners sign up, verify their email, choose their business type, and get their own management system — with data fully isolated per business (multi-tenant, enforced at the database level).

The goal is a free, self-serve alternative to paid ERP/POS setup for small businesses: sign up, pick your business type, and start managing inventory, sales, expenses, and staff — without paying for software or hiring anyone to set it up.

## Tech stack

- **[Next.js](https://nextjs.org)** — App Router, TypeScript
- **[Tailwind CSS](https://tailwindcss.com)** — styling
- **[Supabase](https://supabase.com)** — Postgres database, Auth, and Row Level Security (this is what enforces per-tenant data isolation)
- **[Resend](https://resend.com)** — transactional email (verification, notifications)
- **[Vercel](https://vercel.com)** — deployment

## Getting started locally

```bash
git clone https://github.com/long4sure/JCMD.git
cd JCMD
npm install
```

Copy the example environment file and fill in your own keys:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase and Resend credentials. See [`.env.example`](.env.example) for the full list of required variables — this README intentionally does not include any real secret values.

Then run the dev server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the branching model, commit conventions, and PR process before opening a pull request.

## License

MIT © 2026 JCMD (long4sure) — see [LICENSE](LICENSE) for the full text.
