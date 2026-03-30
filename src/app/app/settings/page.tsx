// src/app/app/settings/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteUser, signOut } from "firebase/auth";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignOut() {
    setMessage(null);
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } catch {
      setMessage("Something went wrong while signing out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setMessage(null);
    setIsDeleting(true);

    try {
      await deleteUser(user);
      setMessage("Your account was deleted.");
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        setMessage("For security, please sign in again before deleting your account.");
      } else {
        setMessage("Something went wrong while deleting your account.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const isDemo = !loading && !user;

  return (
    <AppShell title="Settings">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Account */}
        <section className="ink-card p-5 md:p-6">
          <div className="mb-5">
            <h2
              className="text-base font-semibold"
              style={{ color: "rgb(var(--ink-text))" }}
            >
              Account
            </h2>
            <p className="mt-1 text-sm ink-subtext">
              {loading
                ? "Checking your account status."
                : user
                ? "Your entries can save and sync to your account."
                : "You’re currently exploring in demo mode."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="ink-card-soft p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] ink-subtext">
                    Status
                  </div>
                  <div
                    className="mt-1 text-sm font-medium"
                    style={{ color: "rgb(var(--ink-text))" }}
                  >
                    {loading
                      ? "Loading…"
                      : user
                      ? user.email || "Signed in"
                      : "Demo (not signed in)"}
                  </div>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    border: "1px solid rgb(var(--ink-border))",
                    background: "rgb(var(--ink-surface))",
                    color: user
                      ? "rgb(var(--ink-text))"
                      : "rgb(var(--ink-text-soft))",
                  }}
                >
                  {loading ? "Checking" : user ? "Connected" : "Demo"}
                </span>
              </div>

              <p className="text-sm ink-subtext">
                {loading
                  ? "Please wait a moment."
                  : user
                  ? "Your entries can save and sync across sessions."
                  : "Entries won’t save or sync until you sign in."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {isDemo ? (
                  <Link href="/auth" className="ink-btn ink-btn-primary">
                    Sign in to save
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading || isSigningOut}
                    className="ink-btn ink-btn-secondary"
                  >
                    {isSigningOut ? "Signing out…" : "Sign out"}
                  </button>
                )}
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                border: "1px solid rgb(var(--ink-border))",
                background: "rgb(var(--ink-surface))",
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: "rgb(var(--ink-text))" }}
              >
                Danger zone
              </div>

              <p className="mt-1 text-sm ink-subtext">
                {user
                  ? "Delete your account and remove access to saved entries."
                  : "Account deletion becomes available after you sign in."}
              </p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!user || loading || isDeleting}
                className="mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-medium transition"
                style={{
                  border: "1px solid rgb(var(--ink-border))",
                  background: user
                    ? "rgb(var(--ink-surface-soft))"
                    : "rgb(var(--ink-surface))",
                  color: user
                    ? "rgb(var(--ink-text))"
                    : "rgb(var(--ink-text-soft))",
                  cursor: !user || loading || isDeleting ? "not-allowed" : "pointer",
                  opacity: !user || loading ? 0.65 : 1,
                }}
              >
                {isDeleting ? "Deleting…" : "Delete account"}
              </button>
            </div>

            {message ? (
              <div className="rounded-xl px-4 py-3 text-sm ink-subtext"
                style={{
                  border: "1px solid rgb(var(--ink-border))",
                  background: "rgb(var(--ink-surface-soft))",
                }}
              >
                {message}
              </div>
            ) : null}
          </div>
        </section>

        {/* Preferences */}
        <section className="ink-card p-5 md:p-6">
          <div className="mb-5">
            <h2
              className="text-base font-semibold"
              style={{ color: "rgb(var(--ink-text))" }}
            >
              Preferences
            </h2>
            <p className="mt-1 text-sm ink-subtext">
              Calm defaults and optional personalization.
            </p>
          </div>

          <div className="space-y-3">
            <PreferenceRow
              label="Ultra calm"
              value="Use Appearance"
            />
            <PreferenceRow
              label="Theme"
              value="Use Appearance"
            />
            <PreferenceRow
              label="Export entries"
              value="Planned"
            />
          </div>

          <div className="mt-5 rounded-2xl p-4"
            style={{
              border: "1px solid rgb(var(--ink-border))",
              background: "rgb(var(--ink-surface-soft))",
            }}
          >
            <div
              className="text-sm font-medium"
              style={{ color: "rgb(var(--ink-text))" }}
            >
              Your space
            </div>
            <p className="mt-1 text-sm ink-subtext">
              Appearance controls let you shape the app to feel softer, darker, or more like you.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PreferenceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3"
      style={{
        border: "1px solid rgb(var(--ink-border))",
        background: "rgb(var(--ink-surface-soft))",
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: "rgb(var(--ink-text))" }}
      >
        {label}
      </span>

      <span className="text-xs ink-subtext">{value}</span>
    </div>
  );
}