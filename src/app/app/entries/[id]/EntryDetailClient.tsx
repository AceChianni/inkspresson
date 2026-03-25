// src/app/app/entries/[id]/EntryDetailClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

const moods = ["Calm", "Anxious", "Low", "Overwhelmed", "Energized", "Sad"] as const;
type Mood = (typeof moods)[number];

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
  const entryId = id;

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);

  const [createdLabel, setCreatedLabel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canEdit = useMemo(() => !loading && !!user, [loading, user]);

  useEffect(() => {
    async function load() {
      setError(null);

      if (loading) return;

      if (!user) {
        setBusy(false);
        setError("Sign in to view saved entries.");
        return;
      }

      setBusy(true);
      try {
        const ref = doc(db, "users", user.uid, "entries", entryId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Entry not found.");
          return;
        }

        const data = snap.data() as any;
        setTitle((data.title ?? "") as string);
        setBody((data.body ?? "") as string);
        setMood((data.mood ?? null) as Mood | null);

        const ts = data.createdAt?.toDate?.() as Date | undefined;
        setCreatedLabel(formatFull(ts));
      } catch (e: any) {
        setError(e?.message ?? "Could not load entry.");
      } finally {
        setBusy(false);
      }
    }

    load();
  }, [user, loading, entryId]);

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setToast(null);
    setError(null);

    try {
      const ref = doc(db, "users", user.uid, "entries", entryId);
      await updateDoc(ref, {
        title: title.trim() || null,
        body: body.trim() || "",
        mood: mood ?? null,
        updatedAt: serverTimestamp(),
      });
      setToast("Saved.");
      setTimeout(() => setToast(null), 1500);
    } catch (e: any) {
      setError(e?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    const ok = confirm("Delete this entry? This can’t be undone.");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const ref = doc(db, "users", user.uid, "entries", entryId);
      await deleteDoc(ref);
      router.push("/app/entries");
    } catch (e: any) {
      setError(e?.message ?? "Could not delete entry.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell title="Entry">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app/entries" className="text-sm underline text-neutral-700">
            Back to entries
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canEdit || saving || busy}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={!canEdit || deleting || busy}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {busy ? (
          <div className="text-sm text-neutral-600">Loading…</div>
        ) : error ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {error}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-neutral-200/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-neutral-500">Created</div>
                  <div className="text-sm font-medium">{createdLabel}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => {
                    const selected = m === mood;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(selected ? null : m)}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ink-accent),0.25)]",
                          selected
                            ? "border-transparent text-white"
                            : "border-neutral-200 hover:bg-neutral-100",
                        ].join(" ")}
                        style={selected ? { backgroundColor: "rgb(var(--ink-accent))" } : undefined}
                        aria-pressed={selected}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/70 p-4">
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Untitled entry"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200/70 p-4">
              <label className="text-sm font-medium">Entry</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-2 min-h-[320px] w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                placeholder="No pressure. Start with one sentence."
              />
              {toast && <div className="mt-3 text-sm text-neutral-600">{toast}</div>}
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}