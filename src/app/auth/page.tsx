// src/app/auth/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "/app";
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-neutral-500">Inkspression</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Save your entries when you’re ready.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Explore the app in demo mode. Sign in when you want to save and sync your writing.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Continue demo
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-white"
              >
                Back to landing
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium",
                  mode === "signin" ? "text-white" : "border border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
                style={mode === "signin" ? { backgroundColor: "rgb(var(--ink-accent))" } : undefined}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => setMode("create")}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium",
                  mode === "create" ? "text-white" : "border border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
                style={mode === "create" ? { backgroundColor: "rgb(var(--ink-accent))" } : undefined}
              >
                Create account
              </button>
            </div>

            <h2 className="mt-6 text-lg font-semibold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={busy || !email || !password}
                className="w-full rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}