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

function getCustomMoodKey(uid?: string | null) {
  return uid ? `ink_custom_moods_${uid}` : null;
}

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
    if (!user) {
      setCustomMoods([]);
      return;
    }

    const key = getCustomMoodKey(user.uid);
    if (!key) return;

    const stored = localStorage.getItem(key);
    if (!stored) {
      setCustomMoods([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setCustomMoods(parsed);
      } else {
        setCustomMoods([]);
      }
    } catch {
      setCustomMoods([]);
    }
  }, [user]);

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

    if (allMoods.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setMood(trimmed);
      sessionStorage.setItem("ink_mood", trimmed);
      setNewMood("");
      setAddingMood(false);
      return;
    }

    const updated = [...customMoods, trimmed];
    setCustomMoods(updated);

    const key = getCustomMoodKey(user?.uid);
    if (key) {
      localStorage.setItem(key, JSON.stringify(updated));
    }

    setMood(trimmed);
    sessionStorage.setItem("ink_mood", trimmed);

    setNewMood("");
    setAddingMood(false);
  }

  return (
    <AppShell title="New entry">
  <section className="mx-auto max-w-2xl space-y-6">

    {/* Mood */}
    <div className="space-y-3">
      <div className="text-sm ink-muted">
        How are you feeling?
      </div>

      <div className="flex flex-wrap gap-2">
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
        <div className="flex gap-2">
          <input
            value={newMood}
            onChange={(e) => setNewMood(e.target.value)}
            placeholder="Name your feeling..."
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

    {/* Title */}
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give this moment a name (optional)"
        className="ink-input text-base"
      />
    </div>

    {/* Body (MAIN FOCUS) */}
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="No pressure. Start with one sentence."
        className="ink-input ink-textarea text-base"
      />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between">
      <span className="text-xs ink-muted">
        Write the smallest true thing.
      </span>

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="ink-btn ink-btn-primary"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>

    {toast && (
      <div className="text-sm ink-subtext">
        {toast}
      </div>
    )}
  </section>
</AppShell>
  );
}