// src/app/app/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

const moods = ["Calm", "Anxious", "Low", "Overwhelmed", "Energized", "Sad"] as const;
type Mood = (typeof moods)[number];

export default function DashboardPage() {
  const [mood, setMood] = useState<Mood | null>(null);

  const helperText = useMemo(() => {
    if (!mood) return "How are you right now?";
    const map: Record<Mood, string> = {
      Calm: "Stay soft. Keep it simple.",
      Anxious: "Let it spill out. No structure needed.",
      Low: "One sentence is enough today.",
      Overwhelmed: "Tiny steps. Two minutes max.",
      Energized: "Capture momentum while it’s here.",
      Sad: "Be gentle. Name what hurts.",
    };
    return map[mood];
  }, [mood]);

  return (
    <AppShell title="Dashboard">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/70 p-4">
          <h2 className="text-sm font-medium">Check in</h2>
          <p className="mt-1 text-sm text-neutral-600">{helperText}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {moods.map((m) => {
              const selected = m === mood;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
  const next = selected ? null : m;
  setMood(next);
  if (next) sessionStorage.setItem("ink_mood", next);
  else sessionStorage.removeItem("ink_mood");
}}
                  aria-pressed={selected}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ink-accent),0.25)]",
                    selected
                      ? "border-transparent text-white"
                      : "border-neutral-200 hover:bg-neutral-100",
                  ].join(" ")}
                  style={
                    selected
                      ? { backgroundColor: "rgb(var(--ink-accent))" }
                      : undefined
                  }
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 p-4">
          <h2 className="text-sm font-medium">One next action</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Keep decisions simple: one clear step forward.
          </p>

          <Link
            href="/app/new"
            className="mt-4 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Start a journal entry
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 p-4 md:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium">Recent entries</h2>
            <Link className="text-sm underline" href="/app/entries">
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { title: "A small win", meta: "Calm · Today" },
              { title: "Overthinking spiral", meta: "Anxious · Yesterday" },
              { title: "Soft reset", meta: "Low · 2 days ago" },
            ].map((e) => (
              <div key={e.title} className="rounded-2xl border border-neutral-200 p-4">
                <div className="text-sm font-medium">{e.title}</div>
                <div className="mt-1 text-xs text-neutral-500">{e.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}