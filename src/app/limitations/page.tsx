import Link from "next/link";

export const metadata = {
  title: "Limitations & Transparency — Sagot",
};

export default function LimitationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to home
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        Limitations &amp; Transparency
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 8, 2026</p>

      <p className="mt-6 text-slate-700">
        Sagot is free, and we want to be upfront about how that's possible and
        what it means for you. Here's the honest picture.
      </p>

      <div className="prose-slate mt-10 flex flex-col gap-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Why there are limits
          </h2>
          <p className="mt-2 leading-relaxed">
            Sagot doesn't charge anything because it runs entirely on the free
            tiers of a few great services — a database provider, an email
            provider, and a hosting provider. Free tiers are generous, but
            they're not unlimited. That trade-off is what lets us offer this
            for free instead of charging you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Database</h2>
          <p className="mt-2 leading-relaxed">
            Your data lives in a database on a free-tier plan, which caps the
            total storage and number of rows available, and can pause a
            project after a long stretch of inactivity. Your data is real and
            safely stored — this just isn't enterprise-grade capacity. If you
            ever need to know exactly where those caps sit today, check the
            provider's current published limits rather than assuming a
            specific number, since those tiers do change over time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Email</h2>
          <p className="mt-2 leading-relaxed">
            Verification links and notification emails go out through a
            free-tier email provider, sent from our project's domain. Free
            tiers cap how many emails can go out in a day, and during unusually
            busy signup periods, delivery could be a little delayed. Again,
            check the provider's current limits if the exact number matters to
            you — we'd rather not print a figure here that goes stale.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Hosting</h2>
          <p className="mt-2 leading-relaxed">
            The app itself is hosted on a free/hobby hosting tier. It's
            generous and handles real traffic well, but it comes with usage
            limits and isn't backed by an uptime guarantee or a service-level
            agreement. We keep an eye on it, but we can't promise
            enterprise-grade reliability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            No warranty, best-effort
          </h2>
          <p className="mt-2 leading-relaxed">
            Consistent with our MIT license and{" "}
            <Link href="/terms" className="underline hover:text-slate-900">
              Terms of Service
            </Link>
            , Sagot is provided "as is," on a best-effort basis. It may change,
            and it may occasionally need to pause. It isn't a substitute for
            your own backups of anything genuinely critical to your business.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your data</h2>
          <p className="mt-2 leading-relaxed">
            Because this is a free, best-effort service, we'd encourage you to
            keep your own backup or export of anything critical — your
            product catalog, sales records, and so on — rather than treating
            Sagot as your only copy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            The reassuring part
          </h2>
          <p className="mt-2 leading-relaxed">
            None of this is meant to worry you. These free-tier limits are
            generally more than enough for a typical small business — most
            people running Sagot day-to-day will never notice them. We're just
            telling you upfront, because that's the kind of thing a free,
            open-source project should be honest about.
          </p>
        </section>
      </div>
    </div>
  );
}
