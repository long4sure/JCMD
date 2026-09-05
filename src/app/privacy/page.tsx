import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Sagot",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to home
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 5, 2026</p>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This is a starter policy for an open-source project and not legal
        advice. It describes, in plain language, what Sagot actually does with
        your data.
      </p>

      <div className="prose-slate mt-10 flex flex-col gap-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            What we collect
          </h2>
          <p className="mt-2 leading-relaxed">
            When you sign up, we collect your name, email address, and
            password. When you set up your business, we collect your business
            name and the business type you select. That's it — we don't
            collect anything beyond what's needed to run your account and
            your business's management system.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Where it's stored
          </h2>
          <p className="mt-2 leading-relaxed">
            Your data is stored in a{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              Supabase
            </a>{" "}
            Postgres database, with Row Level Security enabled on every
            table. This means the database itself enforces that your data is
            only ever readable by you and members of your business — not just
            our application code.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Email</h2>
          <p className="mt-2 leading-relaxed">
            We send transactional email — like the account verification link
            you receive when you sign up — through{" "}
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              Resend
            </a>
            . We don't send marketing email, and we don't share your email
            address with anyone else.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Hosting</h2>
          <p className="mt-2 leading-relaxed">
            The application is hosted on{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              Vercel
            </a>
            . Standard hosting-provider request logs may apply, as with any
            web application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Cookies</h2>
          <p className="mt-2 leading-relaxed">
            We use a single type of cookie: an authentication session cookie,
            so you stay signed in between visits. We don't use tracking,
            analytics, or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            We don't sell your data
          </h2>
          <p className="mt-2 leading-relaxed">
            Sagot is free and open-source. There is no business model built on
            selling, renting, or sharing your data with third parties, and
            there never will be.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Deleting your account or data
          </h2>
          <p className="mt-2 leading-relaxed">
            We don't yet have a self-service delete button. To request that
            your account and business data be deleted, please open an issue
            on our{" "}
            <a
              href="https://github.com/long4sure/JCMD/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              GitHub repository
            </a>{" "}
            and we'll take care of it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Questions?</h2>
          <p className="mt-2 leading-relaxed">
            Open an issue on{" "}
            <a
              href="https://github.com/long4sure/JCMD"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              GitHub
            </a>{" "}
            and we'll help out.
          </p>
        </section>
      </div>
    </div>
  );
}
