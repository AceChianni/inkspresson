// src/app/app/entries/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

type Entry = {
  id: string;
  title: string | null;
  mood: string | null;
  createdAtLabel: string;
  createdAtMs: number;
};

const moodOptions = [
  "All",
  "Calm",
  "Anxious",
  "Low",
  "Overwhelmed",
  "Energized",
  "Sad",
] as const;

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

export default function EntriesPage() {
  const { user, loading } = useAuth();

  const [items, setItems] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [moodFilter, setMoodFilter] =
    useState<(typeof moodOptions)[number]>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const demo = useMemo<Entry[]>(
    () => [
      {
        id: "demo-1",
        title: "A small win",
        mood: "Calm",
        createdAtLabel: "Today",
        createdAtMs: Date.now(),
      },
      {
        id: "demo-2",
        title: "Overthinking spiral",
        mood: "Anxious",
        createdAtLabel: "Yesterday",
        createdAtMs: Date.now() - 86400000,
      },
      {
        id: "demo-3",
        title: "Soft reset",
        mood: "Low",
        createdAtLabel: "2 days ago",
        createdAtMs: Date.now() - 2 * 86400000,
      },
    ],
    []
  );

  useEffect(() => {
    async function load() {
      setErr(null);

      if (loading) return;

      if (!user) {
        setItems(demo);
        return;
      }

      setBusy(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "entries"),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const snap = await getDocs(q);

        const rows: Entry[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const ts = data.createdAt?.toDate?.() as Date | undefined;

          return {
            id: docSnap.id,
            title: data.title ?? null,
            mood: data.mood ?? null,
            createdAtLabel: formatRelative(ts),
            createdAtMs: ts ? ts.getTime() : 0,
          };
        });

        setItems(rows);
      } catch (e: any) {
        setErr(e?.message ?? "Could not load entries.");
      } finally {
        setBusy(false);
      }
    }

    load();
  }, [user, loading, demo]);

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const filtered = items.filter((entry) => {
      const title = (entry.title ?? "").toLowerCase();
      const mood = (entry.mood ?? "").toLowerCase();

      const matchesSearch = !q || title.includes(q) || mood.includes(q);
      const matchesMood =
        moodFilter === "All" ? true : entry.mood === moodFilter;

      return matchesSearch && matchesMood;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "newest") return b.createdAtMs - a.createdAtMs;
      return a.createdAtMs - b.createdAtMs;
    });
  }, [items, searchText, moodFilter, sortOrder]);

  const statusText = loading
    ? "Loading entries."
    : busy
    ? "Loading entries."
    : err
    ? `Error loading entries: ${err}`
    : filteredItems.length === 0
    ? items.length === 0
      ? "No entries yet."
      : "No entries match your search or filter."
    : `${filteredItems.length} ${filteredItems.length === 1 ? "entry" : "entries"} shown.`;

  return (
    <AppShell title="Entries">
      <section className="space-y-5" aria-describedby="entries-page-status">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm ink-muted">
              {loading
                ? "Loading…"
                : user
                ? "Your saved entries."
                : "Demo entries available while you explore."}
            </p>
          </div>

          <Link
            href="/app/new"
            className="ink-btn ink-btn-primary inline-flex shrink-0"
          >
            New entry
          </Link>
        </div>

        <p id="entries-page-status" className="sr-only" aria-live="polite">
          {statusText}
        </p>

        <fieldset className="ink-card p-4">
          <legend className="text-sm font-medium text-neutral-900">
            Filter entries
          </legend>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-sm">
              <label
                htmlFor="entry-search"
                className="mb-1 block text-sm font-medium text-neutral-900"
              >
                Search
              </label>
              <input
                id="entry-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by title or mood"
                className="ink-input"
                type="search"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="md:w-52">
                <label
                  htmlFor="entry-mood-filter"
                  className="mb-1 block text-sm font-medium text-neutral-900"
                >
                  Mood
                </label>
                <select
                  id="entry-mood-filter"
                  value={moodFilter}
                  onChange={(e) =>
                    setMoodFilter(e.target.value as (typeof moodOptions)[number])
                  }
                  className="ink-input"
                >
                  {moodOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:w-44">
                <label
                  htmlFor="entry-sort-order"
                  className="mb-1 block text-sm font-medium text-neutral-900"
                >
                  Sort by date
                </label>
                <select
                  id="entry-sort-order"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "newest" | "oldest")
                  }
                  className="ink-input"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        {err && (
          <div
            className="ink-card-soft p-4 text-sm text-neutral-700"
            role="alert"
          >
            {err}
          </div>
        )}

        <div
          className="grid gap-4 md:grid-cols-2"
          aria-label="Entry results"
        >
          {busy ? (
            <div className="ink-card p-5 text-sm ink-muted" aria-live="polite">
              Loading entries…
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="ink-card p-6 text-sm ink-muted md:col-span-2">
              {items.length === 0
                ? "No entries yet. Start with one sentence."
                : "No entries match your search or filter."}
            </div>
          ) : (
            filteredItems.map((e) => {
              const href = e.id.startsWith("demo-")
                ? "/auth"
                : `/app/entries/${e.id}`;

              const entryTitle = e.title?.trim() ? e.title : "Untitled entry";
              const entryMeta = `${e.mood ? `${e.mood}. ` : ""}${e.createdAtLabel}.`;

              return (
                <Link
                  key={e.id}
                  href={href}
                  className="ink-card block p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  aria-label={`${entryTitle}. ${entryMeta} ${user ? "Saved entry." : "Demo entry."}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-900">
                        {entryTitle}
                      </div>
                      <div className="mt-1 text-xs ink-muted">
                        {e.createdAtLabel}
                      </div>
                    </div>

                    {e.mood && (
                      <span className="ink-chip ink-chip-accent shrink-0">
                        {e.mood}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs ink-muted">
                    <span>{user ? "Saved" : "Demo"}</span>
                    <span aria-hidden="true">Open</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </AppShell>
  );
}