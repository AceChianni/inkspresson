// src/app/app/entries/[id]/EntryDetailClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const defaultMoods = [
  "Calm",
  "Anxious",
  "Low",
  "Overwhelmed",
  "Energized",
  "Sad",
];

type Mood = string;

/* ✅ USER-SCOPED KEY */
function getCustomMoodKey(uid?: string | null) {
  return uid ? `ink_custom_moods_${uid}` : null;
}

function formatFull(d?: Date | null) {
  if (!d) return "Just now";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EntryDetailClient({ id }: { id: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [customMoods, setCustomMoods] = useState<string[]>([]);

  const [createdLabel, setCreatedLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canEdit = useMemo(() => !loading && !!user, [loading, user]);

  const allMoods = useMemo(
    () => [...defaultMoods, ...customMoods] as string[],
    [customMoods]
  );

  /* ---------------- LOAD CUSTOM MOODS (FIXED) ---------------- */
  useEffect(() => {
    if (!user) {
      setCustomMoods([]);
      return;
    }

    const key = getCustomMoodKey(user.uid);
    if (!key) return;

    const stored = window.localStorage.getItem(key);

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

  /* ---------------- LOAD ENTRY ---------------- */
  useEffect(() => {
    async function load() {
      setError(null);

      if (loading) return;

      if (!id || typeof id !== "string") {
        setBusy(false);
        setError("Invalid entry.");
        return;
      }

      if (!user) {
        setBusy(false);
        setError("Sign in to view saved entries.");
        return;
      }

      setBusy(true);

      try {
        const ref = doc(db, "users", user.uid, "entries", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Entry not found.");
          return;
        }

        const data = (snap.data() || {}) as {
          title?: unknown;
          body?: unknown;
          mood?: unknown;
          createdAt?: { toDate?: () => Date };
        };

        setTitle(typeof data.title === "string" ? data.title : "");
        setBody(typeof data.body === "string" ? data.body : "");
        setMood(typeof data.mood === "string" ? data.mood : null);

        const ts = data.createdAt?.toDate?.();
        setCreatedLabel(formatFull(ts));
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Could not load entry.";
        setError(message);
      } finally {
        setBusy(false);
      }
    }

    load();
  }, [user, loading, id]);

  /* ---------------- SAVE ---------------- */
  async function handleSave() {
    if (!user || !id) return;

    setSaving(true);
    setToast(null);
    setError(null);

    try {
      const ref = doc(db, "users", user.uid, "entries", id);
      await updateDoc(ref, {
        title: title.trim() || null,
        body: body.trim() || "",
        mood: mood ?? null,
        updatedAt: serverTimestamp(),
      });

      setToast("Saved softly.");
      window.setTimeout(() => setToast(null), 1500);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Could not save changes.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- DELETE ---------------- */
  async function handleDelete() {
    if (!user || !id) return;

    const ok = window.confirm("Delete this entry? This can’t be undone.");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const ref = doc(db, "users", user.uid, "entries", id);
      await deleteDoc(ref);

      /* ✅ CLEAN NAV */
      router.push("/app/entries");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Could not delete entry.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell title="Entry">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app/entries" className="ink-link text-sm">
            Back to entries
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!canEdit || saving || busy}
              className="ink-btn ink-btn-primary"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              onClick={handleDelete}
              disabled={!canEdit || deleting || busy}
              className="ink-btn ink-btn-secondary"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {busy ? (
          <div className="ink-subtext text-sm">Loading…</div>
        ) : error ? (
          <div className="ink-alert text-sm">{error}</div>
        ) : (
          <>
            <div className="ink-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs ink-subtext">Created</div>
                  <div className="text-sm font-medium">
                    {createdLabel}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allMoods.map((m) => {
                    const selected = m === mood;

                    return (
                      <button
                        key={m}
                        onClick={() => setMood(selected ? null : m)}
                        className={`ink-chip ${
                          selected ? "ink-chip-active" : ""
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="ink-card p-4">
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="ink-input mt-2"
              />
            </div>

            <div className="ink-card p-4">
              <label className="text-sm font-medium">Entry</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="ink-input ink-textarea mt-2"
              />
              {toast && (
                <div className="mt-3 text-sm ink-subtext">{toast}</div>
              )}
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}