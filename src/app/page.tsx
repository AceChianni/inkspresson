// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        {/* Hero */}
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--ink-accent))]" />
            Neurodivergent-friendly journaling
          </div>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Inkspression
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-neutral-600">
            A calm digital space designed to reduce overwhelm.
            Gentle structure. Emotional check-ins. No streaks. No shame.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {/* Primary */}
            <Link
              href="/app"
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Try the demo
            </Link>

            {/* Secondary */}
            <Link
              href="/auth"
              className="rounded-2xl border border-neutral-300 px-6 py-3 text-sm font-medium transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-sm text-neutral-500">
            No account needed to explore. Create one when you’re ready to save entries.
          </p>
        </div>

        {/* Feature Preview */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Low cognitive load",
              desc: "One primary action per screen. No dense dashboards.",
            },
            {
              title: "Emotional check-ins",
              desc: "Regulate before you reflect.",
            },
            {
              title: "No streak pressure",
              desc: "Return when you're ready. No guilt mechanics.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}