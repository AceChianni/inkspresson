// src/app/app/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

const defaultMoods = [
  "Calm",
  "Anxious",
  "Low",
  "Overwhelmed",
  "Energized",
  "Sad",
] as const;

type DefaultMood = (typeof defaultMoods)[number];
type Mood = DefaultMood | string;

type CardEntry = { id: string; title: string; meta: string };

const CUSTOM_MOODS_KEY = "ink_custom_moods";
const CURRENT_MOOD_KEY = "ink_mood";

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

function normalizeMoodLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [mood, setMood] = useState<Mood | null>(null);
  const [customMoods, setCustomMoods] = useState<string[]>([]);
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);
  const [customMoodInput, setCustomMoodInput] = useState("");
  const [editingMood, setEditingMood] = useState<string | null>(null);
  const [editingMoodValue, setEditingMoodValue] = useState("");
  const [manageCustomMoods, setManageCustomMoods] = useState(false);

  const [recent, setRecent] = useState<CardEntry[]>([
    { id: "demo-1", title: "A small win", meta: "Calm · Today" },
    { id: "demo-2", title: "Overthinking spiral", meta: "Anxious · Yesterday" },
    { id: "demo-3", title: "Soft reset", meta: "Low · 2 days ago" },
  ]);

  const [busy, setBusy] = useState(false);

  const allMoods = useMemo(() => {
    return [...defaultMoods, ...customMoods] as string[];
  }, [customMoods]);

  const helperText = useMemo(() => {
    if (!mood) return "Choose one word. No deep thinking required.";

    const presetMap: Record<DefaultMood, string> = {
      Calm: "Stay soft. Keep it simple.",
      Anxious: "Let it spill out. No structure needed.",
      Low: "One sentence is enough today.",
      Overwhelmed: "Tiny steps. Two minutes max.",
      Energized: "Capture momentum while it’s here.",
      Sad: "Be gentle. Name what hurts.",
    };

    if (defaultMoods.includes(mood as DefaultMood)) {
      return presetMap[mood as DefaultMood];
    }

    return `Start with ${String(mood).toLowerCase()}. Let that be enough for now.`;
  }, [mood]);

  useEffect(() => {
    const savedMood = window.localStorage.getItem(CURRENT_MOOD_KEY);
    const savedCustomMoods = window.localStorage.getItem(CUSTOM_MOODS_KEY);

    if (savedCustomMoods) {
      try {
        const parsed = JSON.parse(savedCustomMoods) as string[];
        if (Array.isArray(parsed)) {
          setCustomMoods(parsed);
        }
      } catch {
        // ignore invalid storage
      }
    }

    if (savedMood) {
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

  function persistCustomMoods(next: string[]) {
    setCustomMoods(next);
    window.localStorage.setItem(CUSTOM_MOODS_KEY, JSON.stringify(next));
  }

  function handleMoodSelect(nextMood: string) {
    setMood(nextMood);
    window.localStorage.setItem(CURRENT_MOOD_KEY, nextMood);
    setShowCustomMoodInput(false);
    setCustomMoodInput("");
    setEditingMood(null);
    setEditingMoodValue("");
  }

  function handleAddCustomMood() {
    const normalized = normalizeMoodLabel(customMoodInput);
    if (!normalized) return;

    const alreadyExists = allMoods.some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase()
    );

    if (!alreadyExists) {
      const updated = [...customMoods, normalized];
      persistCustomMoods(updated);
    }

    setMood(normalized);
    window.localStorage.setItem(CURRENT_MOOD_KEY, normalized);
    setCustomMoodInput("");
    setShowCustomMoodInput(false);
  }

  function startEditingMood(targetMood: string) {
    setEditingMood(targetMood);
    setEditingMoodValue(targetMood);
    setShowCustomMoodInput(false);
  }

  function handleSaveEditedMood(originalMood: string) {
    const normalized = normalizeMoodLabel(editingMoodValue);
    if (!normalized) return;

    const alreadyExists = allMoods.some(
      (existing) =>
        existing.toLowerCase() === normalized.toLowerCase() &&
        existing.toLowerCase() !== originalMood.toLowerCase()
    );

    if (alreadyExists) return;

    const updated = customMoods.map((item) =>
      item === originalMood ? normalized : item
    );

    persistCustomMoods(updated);

    if (mood === originalMood) {
      setMood(normalized);
      window.localStorage.setItem(CURRENT_MOOD_KEY, normalized);
    }

    setEditingMood(null);
    setEditingMoodValue("");
  }

  function handleRemoveMood(targetMood: string) {
    const updated = customMoods.filter((item) => item !== targetMood);
    persistCustomMoods(updated);

    if (mood === targetMood) {
      setMood(null);
      window.localStorage.removeItem(CURRENT_MOOD_KEY);
    }

    if (editingMood === targetMood) {
      setEditingMood(null);
      setEditingMoodValue("");
    }
  }

  const hasCustomMoods = customMoods.length > 0;

  return (
    <AppShell title="Dashboard">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="ink-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "rgb(var(--ink-text))" }}
              >
                How are you right now?
              </h2>
              <p className="ink-subtext mt-1 text-sm">{helperText}</p>
            </div>

            {hasCustomMoods ? (
              <button
                type="button"
                onClick={() => setManageCustomMoods((prev) => !prev)}
                className="ink-btn ink-btn-secondary"
              >
                {manageCustomMoods ? "Done" : "Manage"}
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {defaultMoods.map((m) => {
              const selected = m === mood;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMoodSelect(m)}
                  className={`ink-chip ${selected ? "ink-chip-active" : ""}`}
                  aria-pressed={selected}
                >
                  {m}
                </button>
              );
            })}

            {customMoods.map((m) => {
              const selected = m === mood;

              return (
                <div key={m} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoodSelect(m)}
                    className={`ink-chip ${selected ? "ink-chip-active" : ""}`}
                    aria-pressed={selected}
                  >
                    {m}
                  </button>

                  {manageCustomMoods ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditingMood(m)}
                        className="ink-chip ink-chip-danger"
                        aria-label={`Edit ${m}`}
                        title={`Edit ${m}`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMood(m)}
                        className="ink-chip ink-chip-danger"
                        aria-label={`Remove ${m}`}
                        title={`Remove ${m}`}
                      >
                        ×
                      </button>
                    </>
                  ) : null}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setShowCustomMoodInput((prev) => !prev);
                setEditingMood(null);
                setEditingMoodValue("");
              }}
              className={`ink-chip ink-chip-action ${
                showCustomMoodInput ? "ink-chip-active" : ""
              }`}
              aria-pressed={showCustomMoodInput}
            >
              + Custom mood
            </button>
          </div>

          {showCustomMoodInput ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="block flex-1">
                <span className="sr-only">Add a custom mood</span>
                <input
                  type="text"
                  value={customMoodInput}
                  onChange={(e) => setCustomMoodInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomMood();
                    }
                  }}
                  placeholder="Add your own mood"
                  className="ink-input"
                  maxLength={24}
                />
              </label>

              <button
                type="button"
                onClick={handleAddCustomMood}
                disabled={!customMoodInput.trim()}
                className="ink-btn ink-btn-primary"
              >
                Add mood
              </button>
            </div>
          ) : null}

          {editingMood ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="block flex-1">
                <span className="sr-only">Edit custom mood</span>
                <input
                  type="text"
                  value={editingMoodValue}
                  onChange={(e) => setEditingMoodValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveEditedMood(editingMood);
                    }
                  }}
                  placeholder="Rename custom mood"
                  className="ink-input"
                  maxLength={24}
                />
              </label>

              <button
                type="button"
                onClick={() => handleSaveEditedMood(editingMood)}
                disabled={!editingMoodValue.trim()}
                className="ink-btn ink-btn-primary"
              >
                Save
              </button>
            </div>
          ) : null}

          {showCustomMoodInput ? (
            <p className="mt-2 text-xs ink-subtext">
              Add a mood that feels more true to you. It will stay here for later.
            </p>
          ) : editingMood ? (
            <p className="mt-2 text-xs ink-subtext">
              Rename your custom mood without losing it from your dashboard.
            </p>
          ) : manageCustomMoods ? (
            <p className="mt-2 text-xs ink-subtext">
              Use edit or remove to keep your custom moods feeling like you.
            </p>
          ) : null}
        </div>

        <div className="ink-card p-4">
          <h2
            className="text-sm font-semibold"
            style={{ color: "rgb(var(--ink-text))" }}
          >
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
            <h2
              className="text-sm font-semibold"
              style={{ color: "rgb(var(--ink-text))" }}
            >
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
                <span className="ink-subtext">
                  Nothing here yet. Just begin when you’re ready.
                </span>
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