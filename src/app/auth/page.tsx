// src/app/auth/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();

    setBusy(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      router.push("/app");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-6 md:grid-cols-2">

          {/* LEFT PANEL */}
          <section className="ink-card p-6 md:p-8">
            <div className="text-xs uppercase tracking-[0.14em] ink-subtext">
              Inkspression
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Save your entries when you’re ready.
            </h1>

            <p className="mt-4 max-w-lg text-base ink-subtext">
              Explore the app in demo mode. Sign in when you want to save and sync
              your writing.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app" className="ink-btn ink-btn-primary">
                Continue demo
              </Link>

              <Link href="/" className="ink-btn ink-btn-secondary">
                Back to landing
              </Link>
            </div>
          </section>

          {/* FORM PANEL */}
          <section className="ink-card p-6 md:p-8">
            {/* Mode Toggle */}
            <div
              className="flex gap-2"
              role="tablist"
              aria-label="Authentication mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => setMode("signin")}
                className="rounded-2xl px-4 py-2 text-sm font-medium transition"
                style={{
                  background:
                    mode === "signin"
                      ? "rgb(var(--ink-accent))"
                      : "rgb(var(--ink-surface))",
                  color:
                    mode === "signin"
                      ? "rgb(var(--ink-accent-contrast))"
                      : "rgb(var(--ink-text))",
                  border:
                    mode === "signin"
                      ? "1px solid rgb(var(--ink-accent))"
                      : "1px solid rgb(var(--ink-border))",
                }}
              >
                Sign in
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === "create"}
                onClick={() => setMode("create")}
                className="rounded-2xl px-4 py-2 text-sm font-medium transition"
                style={{
                  background:
                    mode === "create"
                      ? "rgb(var(--ink-accent))"
                      : "rgb(var(--ink-surface))",
                  color:
                    mode === "create"
                      ? "rgb(var(--ink-accent-contrast))"
                      : "rgb(var(--ink-text))",
                  border:
                    mode === "create"
                      ? "1px solid rgb(var(--ink-accent))"
                      : "1px solid rgb(var(--ink-border))",
                }}
              >
                Create account
              </button>
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-1 text-sm ink-subtext">
              {mode === "signin"
                ? "Sign in when you’re ready to save your writing."
                : "Create an account to keep your entries with you."}
            </p>

            {/* FORM */}
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="auth-email" className="text-sm font-medium">
                  Email
                </label>

                <input
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="ink-input mt-2"
                  autoComplete="email"
                  required
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="text-sm font-medium">
                  Password
                </label>

                <input
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="ink-input mt-2"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>

              {error && (
                <div id="auth-error" className="ink-alert text-sm" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !email || !password}
                className="ink-btn ink-btn-primary w-full"
              >
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}