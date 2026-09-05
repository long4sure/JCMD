import Image from "next/image";
import Link from "next/link";
import {
  IconCoffee,
  IconToolsKitchen2,
  IconBuildingStore,
  IconSparkles,
  IconCalendarEvent,
  IconDots,
  IconLock,
  IconMailCheck,
  IconPackage,
  IconInfinity,
  IconBrandGithub,
} from "@tabler/icons-react";
import { BUSINESS_TYPES, type BusinessTypeSlug } from "@/lib/business-types";
import { Reveal } from "@/components/reveal";

const BUSINESS_TYPE_ICONS: Record<BusinessTypeSlug, React.ComponentType<{ className?: string }>> = {
  coffee: IconCoffee,
  restaurant: IconToolsKitchen2,
  retail: IconBuildingStore,
  salon: IconSparkles,
  services: IconCalendarEvent,
  other: IconDots,
};

const FEATURES = [
  {
    icon: IconLock,
    title: "Your data is yours",
    description:
      "Every business's data is fully isolated at the database level with Row Level Security — not just app-level filtering.",
  },
  {
    icon: IconMailCheck,
    title: "Email-verified accounts",
    description:
      "Real signup with email verification, so every account on the platform is a real one.",
  },
  {
    icon: IconPackage,
    title: "Manage products & inventory",
    description:
      "Track what you sell, your stock levels, and pricing — the core of running any small business.",
  },
  {
    icon: IconInfinity,
    title: "Free. Forever.",
    description:
      "No trial, no plan to upgrade to, no credit card. JCMD is free and open-source, full stop.",
  },
];

const STEPS = [
  { step: "1", title: "Sign up", description: "Create your account with just a name, email, and password." },
  { step: "2", title: "Verify your email", description: "Click the link we send you to confirm it's really you." },
  { step: "3", title: "Pick your business type", description: "Coffee shop, retail, salon, or something else — tell us what you run." },
  { step: "4", title: "Start managing", description: "Your management system is ready. Add products and get to work." },
];

const BUILT_WITH = [
  { name: "Next.js", href: "https://nextjs.org" },
  { name: "Supabase", href: "https://supabase.com" },
  { name: "Resend", href: "https://resend.com" },
  { name: "Vercel", href: "https://vercel.com" },
  { name: "Tailwind CSS", href: "https://tailwindcss.com" },
];

const AI_TOOLS = [
  { name: "Claude", href: "https://claude.ai" },
  { name: "ChatGPT", href: "https://chatgpt.com" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="JCMD" width={32} height={32} className="rounded-full" priority />
            <span className="text-lg font-bold tracking-tight text-slate-900">JCMD</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-shine rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO (dark, animated) ── */}
        <section className="relative overflow-hidden bg-slate-950">
          {/* Aurora: large, slow, blurred color blobs drifting + breathing. */}
          <div
            aria-hidden
            className="animate-aurora-1 pointer-events-none absolute -top-1/4 left-[10%] -z-10 h-[560px] w-[560px] rounded-full bg-amber-500/25 blur-[100px]"
          />
          <div
            aria-hidden
            className="animate-aurora-2 pointer-events-none absolute -top-1/3 right-[5%] -z-10 h-[520px] w-[520px] rounded-full bg-indigo-500/25 blur-[100px]"
          />
          {/* Smaller floating orbs — independent drift, more defined edges. */}
          <div
            aria-hidden
            className="animate-orb-drift pointer-events-none absolute top-[15%] left-[20%] -z-10 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl"
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute top-[55%] right-[15%] -z-10 h-20 w-20 rounded-full bg-violet-400/20 blur-2xl"
          />
          <div
            aria-hidden
            className="animate-float-slower pointer-events-none absolute bottom-[10%] left-[35%] -z-10 h-16 w-16 rounded-full bg-sky-400/15 blur-2xl"
          />
          {/* Faint grid + grain for texture, static. */}
          <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10" />
          <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 -z-10" />

          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              className="mx-auto mb-6 rounded-full ring-1 ring-white/10"
              priority
            />
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
              Free &amp; open-source
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Run your whole business. Pay nothing.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
              Free, open-source management systems for coffee shops, retail,
              salons, and more — sign up, pick your business type, and start
              managing in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="btn-shine btn-glow-amber animate-gradient-pan w-full rounded-md bg-[linear-gradient(110deg,theme(colors.amber.500),theme(colors.orange.400),theme(colors.amber.500))] px-6 py-3 text-base font-semibold text-slate-950 sm:w-auto"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="w-full rounded-md border border-white/20 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* ── BUSINESS TYPES ── */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                Built for real businesses
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Whatever you run, JCMD fits.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {BUSINESS_TYPES.map((type) => {
                const Icon = BUSINESS_TYPE_ICONS[type.slug];
                return (
                  <Reveal key={type.slug}>
                    <div className="hover-lift hover-glow-amber flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {type.label}
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                Why JCMD
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Everything you need, nothing you don&apos;t.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <Reveal key={feature.title}>
                  <div className="hover-lift hover-glow-amber h-full rounded-xl border border-slate-200 p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                How it works
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                From sign up to selling, in four steps.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <Reveal key={s.step} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUILT WITH ── */}
        <section className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Built with free &amp; open tools
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              JCMD is free because it's built on great free and open-source
              tools. Thank you to the projects that make this possible.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {BUILT_WITH.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  {tool.name}
                </a>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-xl text-sm text-slate-500">
              Built with the help of AI pair-programming (
              {AI_TOOLS.map((tool, i) => (
                <span key={tool.name}>
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                  >
                    {tool.name}
                  </a>
                  {i < AI_TOOLS.length - 1 ? " & " : ""}
                </span>
              ))}
              ).
            </p>
          </Reveal>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="border-t border-slate-200 bg-slate-900 py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to run your business for free?
            </h2>
            <div className="mt-6">
              <Link
                href="/signup"
                className="btn-shine inline-block rounded-md bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-100"
              >
                Get started free
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="JCMD" width={24} height={24} className="rounded-full" />
            <span className="text-sm text-slate-500">
              JCMD is free and open-source, MIT licensed.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <a
              href="https://github.com/long4sure/JCMD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-slate-900"
            >
              <IconBrandGithub className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
