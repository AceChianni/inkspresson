// src/app/app/new/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const defaultMoods = [
  "Calm",
  "Anxious",
  "Low",
  "Overwhelmed",
  "Energized",
  "Sad",
];

type Mood = string;

const CUSTOM_MOODS_KEY = "ink_custom_moods";

export default function NewEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [mood, setMood] = useState<Mood | null>(null);
  const [customMoods, setCustomMoods] = useState<string[]>([]);

  const [addingMood, setAddingMood] = useState(false);
  const [newMood, setNewMood] = useState("");

  const [saving, setSaving] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const allMoods = [...defaultMoods, ...customMoods];

  useEffect(() => {
    const saved = sessionStorage.getItem("ink_mood");
    if (saved) setMood(saved);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_MOODS_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setCustomMoods(parsed);
    } catch {}
  }, []);

  const canSave = useMemo(() => {
    if (loading || !user) return false;
    return Boolean(title.trim() || body.trim());
  }, [loading, user, title, body]);

  async function handleSave() {
    if (loading) return;

    if (!user) {
      setShowGate(true);
      return;
    }

    if (!canSave) return;

    setSaving(true);
    setToast(null);

    try {
      await addDoc(collection(db, "users", user.uid, "entries"), {
        title: title.trim() || null,
        body: body.trim() || "",
        mood: mood ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/app/entries");
    } catch (e: any) {
      setToast(e?.message ?? "Could not save entry.");
    } finally {
      setSaving(false);
    }
  }

  function handleAddMood() {
    const trimmed = newMood.trim();
    if (!trimmed) return;

    if (allMoods.includes(trimmed)) {
      setNewMood("");
      setAddingMood(false);
      return;
    }

    const updated = [...customMoods, trimmed];
    setCustomMoods(updated);
    localStorage.setItem(CUSTOM_MOODS_KEY, JSON.stringify(updated));

    setMood(trimmed);
    localStorage.setItem("ink_mood", trimmed);

    setNewMood("");
    setAddingMood(false);
  }

  return (
    <AppShell title="New entry">
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="ink-card p-4">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ink-input mt-2"
              placeholder="What’s on your mind?"
            />
          </div>

          <div className="ink-card p-4">
            <div className="text-sm font-medium">Mood</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {allMoods.map((m) => {
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
                  >
                    {m}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setAddingMood(true)}
                className="ink-chip ink-chip-action"
              >
                + Custom
              </button>
            </div>

            {addingMood && (
              <div className="mt-3 flex gap-2">
                <input
                  value={newMood}
                  onChange={(e) => setNewMood(e.target.value)}
                  placeholder="Your mood..."
                  className="ink-input"
                />

                <button
                  type="button"
                  onClick={handleAddMood}
                  className="ink-btn ink-btn-primary"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ink-card p-4">
          <label className="text-sm font-medium">Entry</label>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="ink-input ink-textarea mt-2"
            placeholder="No pressure. Start with one sentence."
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs ink-muted">
              Tip: write the smallest true thing.
            </span>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="ink-btn ink-btn-primary"
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </div>

          {!user && showGate && (
            <div className="ink-alert mt-3 text-sm">
              You’re in demo mode.{" "}
              <Link href="/auth" className="ink-link">
                Sign in
              </Link>{" "}
              to save entries.
            </div>
          )}

          {toast && <div className="mt-3 text-sm ink-subtext">{toast}</div>}
        </div>
      </section>
    </AppShell>
  );
}