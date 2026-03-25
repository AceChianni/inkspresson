// src/app/app/new/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const moods = ["Calm", "Anxious", "Low", "Overwhelmed", "Energized", "Sad"] as const;
type Mood = (typeof moods)[number];

export default function NewEntryPage() {
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [mood, setMood] = useState<Mood | null>(null);
  const [editingMood, setEditingMood] = useState(false);

  const [saving, setSaving] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("ink_mood") as Mood | null;
    if (saved && moods.includes(saved)) setMood(saved);
  }, []);

  const showPicker = editingMood || !mood;

  const canSave = useMemo(() => {
    if (loading) return false;
    if (!user) return false;
    return title.trim().length > 0 || body.trim().length > 0;
  }, [loading, user, title, body]);

  async function handleSave() {
    if (loading) return;

    if (!user) {
      setShowGate(true);
      return;
    }

    if (!canSave) return;

    setSaving(true);
    setShowGate(false);
    setToast(null);

    try {
      await addDoc(collection(db, "users", user.uid, "entries"), {
        title: title.trim() || null,
        body: body.trim() || "",
        mood: mood ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setBody("");
      setToast("Entry saved.");
      setTimeout(() => setToast(null), 1500);
    } catch (e: any) {
      setToast(e?.message ?? "Could not save entry.");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="New entry">
      <section className="space-y-4" aria-describedby="new-entry-status">
        <p id="new-entry-status" className="sr-only" aria-live="polite">
          {loading
            ? "Checking sign-in status."
            : saving
            ? "Saving entry."
            : toast
            ? toast
            : showGate
            ? "You are in demo mode. Sign in to save entries."
            : "Create a new journal entry."}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="ink-card p-4">
            <label
              htmlFor="entry-title"
              className="text-sm font-medium text-neutral-900"
            >
              Title
            </label>
            <input
              id="entry-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ink-input mt-2"
              placeholder="What’s on your mind?"
              autoComplete="off"
            />
          </div>

          <fieldset className="ink-card p-4">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-sm font-medium text-neutral-900">
                Mood
              </legend>

              {mood && (
                <button
                  type="button"
                  onClick={() => setEditingMood((v) => !v)}
                  aria-expanded={showPicker}
                  aria-controls="mood-picker"
                  className="ink-btn ink-btn-secondary"
                >
                  {editingMood ? "Done" : "Change"}
                </button>
              )}
            </div>

            {mood && !showPicker && (
              <div className="mt-3">
                <span
                  className="ink-chip ink-chip-accent"
                  aria-label={`Selected mood: ${mood}`}
                >
                  {mood}
                </span>
              </div>
            )}

            {showPicker && (
              <div
                id="mood-picker"
                className="mt-3 flex flex-wrap gap-2"
                role="group"
                aria-label="Choose a mood"
              >
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
                      aria-label={`${m}${selected ? ", selected" : ""}`}
                      className={[
                        "rounded-xl border px-3 py-2 text-sm transition",
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
          </fieldset>
        </div>

        <div className="ink-card p-4">
          <label
            htmlFor="entry-body"
            className="text-sm font-medium text-neutral-900"
          >
            Entry
          </label>
          <textarea
            id="entry-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="ink-input mt-2 min-h-[280px] resize-y"
            placeholder="No pressure. Start with one sentence."
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs ink-muted">
              Tip: write the smallest true thing.
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="ink-btn ink-btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </div>

          {!loading && !user && showGate && (
            <div
              className="ink-card-soft mt-3 p-3 text-sm text-neutral-700"
              role="alert"
            >
              You’re in demo mode.{" "}
              <Link href="/auth" className="font-medium underline">
                Sign in
              </Link>{" "}
              to save entries.
            </div>
          )}

          {toast && !showGate && (
            <div className="mt-3 text-sm text-neutral-700" role="status">
              {toast}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}