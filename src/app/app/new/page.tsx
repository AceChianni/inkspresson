// src/app/app/new/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

const moods = ["Calm", "Anxious", "Low", "Overwhelmed", "Energized", "Sad"] as const;
type Mood = (typeof moods)[number];

export default function NewEntryPage() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [editingMood, setEditingMood] = useState(false);
  const [showGate, setShowGate] = useState(false);

  // Pull mood from Dashboard
  useEffect(() => {
    const saved = sessionStorage.getItem("ink_mood") as Mood | null;
    if (saved && moods.includes(saved)) setMood(saved);
  }, []);

  const showPicker = editingMood || !mood;

  return (
    <AppShell title="New entry">
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200/70 p-4">
            <label className="text-sm font-medium">Title</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="What’s on your mind?"
            />
          </div>

          <div className="rounded-2xl border border-neutral-200/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">Mood</label>

              {mood && (
                <button
                  type="button"
                  onClick={() => setEditingMood((v) => !v)}
                  className="rounded-xl border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-100"
                >
                  {editingMood ? "Done" : "Change"}
                </button>
              )}
            </div>

            {mood && !showPicker && (
              <div className="mt-3">
                <span
                  className="inline-flex items-center rounded-xl px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: "rgb(var(--ink-accent))" }}
                >
                  {mood}
                </span>
              </div>
            )}

            {showPicker && (
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
                        setEditingMood(false);
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
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 p-4">
          <label className="text-sm font-medium">Entry</label>
          <textarea
            className="mt-2 min-h-[280px] w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
            placeholder="No pressure. Start with one sentence."
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-500">
              Tip: write the smallest true thing.
            </span>

            <button
              type="button"
              onClick={() => setShowGate(true)}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Save entry
            </button>
          </div>

          {showGate && (
            <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              You’re in demo mode.{" "}
              <Link href="/auth" className="font-medium underline">
                Sign in
              </Link>{" "}
              to save entries.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}