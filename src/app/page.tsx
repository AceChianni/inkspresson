// src/app/page.tsx
"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm"
          style={{
            background: "rgb(var(--ink-surface))",
            border: "1px solid rgb(var(--ink-border))",
            color: "rgb(var(--ink-text))",
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "rgb(var(--ink-accent))" }}
          />
          Neurodivergent-friendly journaling
        </div>

        {/* Hero */}
        <h1
          className="mt-8 text-5xl font-semibold tracking-tight md:text-6xl"
          style={{ color: "rgb(var(--ink-text))" }}
        >
          Inkspression
        </h1>

        <p className="mt-4 max-w-xl text-lg ink-subtext">
          A calm digital space designed to reduce overwhelm. Gentle structure.
          Emotional check-ins. No streaks. No shame.
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/app" className="ink-btn ink-btn-primary">
            Try the demo
          </Link>

          <Link href="/auth" className="ink-btn ink-btn-secondary">
            Sign in
          </Link>
        </div>

        <p className="mt-3 text-sm ink-subtext">
          No account needed to explore. Create one when you’re ready to save entries.
        </p>

        {/* Features */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Low cognitive load"
            description="One primary action per screen. No dense dashboards."
          />

          <FeatureCard
            title="Emotional check-ins"
            description="Regulate before you reflect."
          />

          <FeatureCard
            title="No streak pressure"
            description="Return when you're ready. No guilt mechanics."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="ink-card p-5">
      <div
        className="text-sm font-semibold"
        style={{ color: "rgb(var(--ink-text))" }}
      >
        {title}
      </div>

      <p className="mt-2 text-sm ink-subtext">{description}</p>
    </div>
  );
}