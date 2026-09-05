import Link from "next/link";

export const metadata = {
  title: "Terms of Service — JCMD",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to home
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 5, 2026</p>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This is a starter policy for an open-source project and not legal
        advice.
      </p>

      <div className="prose-slate mt-10 flex flex-col gap-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Free and open-source
          </h2>
          <p className="mt-2 leading-relaxed">
            JCMD is free, open-source software, licensed under the MIT
            License. You can read, fork, and reuse the code at{" "}
            <a
              href="https://github.com/long4sure/JCMD"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              github.com/long4sure/JCMD
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Provided &quot;as is&quot;
          </h2>
          <p className="mt-2 leading-relaxed">
            Consistent with the MIT License the software is released under,
            JCMD is provided &quot;as is&quot;, without warranty of any kind,
            express or implied. We do our best to keep it running and your
            data safe, but we make no guarantees about uptime, availability,
            or fitness for any particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Acceptable use
          </h2>
          <p className="mt-2 leading-relaxed">
            Use JCMD lawfully and in good faith. Don't attempt to access
            another business's data, disrupt the service, or use it for
            anything illegal. Accounts used to abuse the platform may be
            suspended or removed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Your account and your data
          </h2>
          <p className="mt-2 leading-relaxed">
            You're responsible for keeping your account credentials secure
            and for the accuracy of the business data you enter (product
            listings, prices, stock levels, and so on). Since this is a free,
            community-run project, we'd encourage you not to treat it as your
            only copy of business-critical records.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            The service may change
          </h2>
          <p className="mt-2 leading-relaxed">
            JCMD is a passion project. We may add, change, or remove
            features, and — while we hope not to — we may need to pause or
            discontinue the hosted free service at some point. Because it's
            open-source, the code will remain available either way.
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
