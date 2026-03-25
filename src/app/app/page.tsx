// src/app/app/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

const moods = ["Calm", "Anxious", "Low", "Overwhelmed", "Energized", "Sad"] as const;
type Mood = (typeof moods)[number];

type CardEntry = { id: string; title: string; meta: string };

function formatRelative(d?: Date | null) {
  if (!d) return "Just now";
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [mood, setMood] = useState<Mood | null>(null);

  const [recent, setRecent] = useState<CardEntry[]>([
    { id: "demo-1", title: "A small win", meta: "Calm · Today" },
    { id: "demo-2", title: "Overthinking spiral", meta: "Anxious · Yesterday" },
    { id: "demo-3", title: "Soft reset", meta: "Low · 2 days ago" },
  ]);

  const [busy, setBusy] = useState(false);

  const helperText = useMemo(() => {
    if (!mood) return "Choose one word. No deep thinking required.";
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

  useEffect(() => {
    const savedMood = sessionStorage.getItem("ink_mood") as Mood | null;
    if (savedMood && moods.includes(savedMood)) {
      setMood(savedMood);
    }
  }, []);

  useEffect(() => {
    async function loadRecent() {
      if (loading) return;
      if (!user) return;

      setBusy(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "entries"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snap = await getDocs(q);

        const rows = snap.docs.map((docSnap) => {
          const data = docSnap.data() as {
            createdAt?: { toDate?: () => Date };
            mood?: string;
            title?: string;
          };

          const ts = data.createdAt?.toDate?.();
          const entryMood = data.mood ? String(data.mood) : null;
          const title = (data.title && String(data.title).trim()) || "Untitled entry";
          const when = formatRelative(ts);

          return {
            id: docSnap.id,
            title,
            meta: entryMood ? `${entryMood} · ${when}` : when,
          };
        });

        setRecent(rows.length ? rows : []);
      } finally {
        setBusy(false);
      }
    }

    loadRecent();
  }, [user, loading]);

  return (
    <AppShell title="Dashboard">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="ink-card p-4">
          <h2 className="text-sm font-semibold" style={{ color: "rgb(var(--ink-text))" }}>
            How are you right now?
          </h2>
          <p className="ink-subtext mt-1 text-sm">{helperText}</p>

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
                  className={`ink-chip ${selected ? "ink-chip-active" : ""}`}
                  aria-pressed={selected}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ink-card p-4">
          <h2 className="text-sm font-semibold" style={{ color: "rgb(var(--ink-text))" }}>
            One next action
          </h2>
          <p className="ink-subtext mt-1 text-sm">
            Keep decisions simple: one clear step forward.
          </p>

          <Link href="/app/new" className="ink-btn ink-btn-primary mt-4 inline-flex">
            Start a journal entry
          </Link>
        </div>

        <div className="ink-card p-4 md:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold" style={{ color: "rgb(var(--ink-text))" }}>
              Recent entries
            </h2>

            <Link className="ink-link text-sm" href="/app/entries">
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {busy ? (
              <div className="ink-subtext text-sm">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="ink-card-soft p-4 text-sm md:col-span-3">
                <span className="ink-subtext">No entries yet. Start with one sentence.</span>
              </div>
            ) : (
              recent.map((e) => {
                const href = e.id.startsWith("demo-") ? "/auth" : `/app/entries/${e.id}`;

                return (
                  <Link key={e.id} href={href} className="ink-card ink-card-link p-4">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "rgb(var(--ink-text))" }}
                    >
                      {e.title}
                    </div>
                    <div className="mt-1 text-xs ink-subtext">{e.meta}</div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}