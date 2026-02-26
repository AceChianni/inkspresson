// src/app/app/settings/page.tsx
import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200/70 p-4">
          <h2 className="text-sm font-semibold">Account</h2>
          <p className="mt-1 text-sm text-neutral-600">
            You’re currently in demo mode.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-xs text-neutral-500">Status</div>
              <div className="mt-1 text-sm font-medium">Demo (not signed in)</div>

              <div className="mt-3 text-xs text-neutral-600">
                Entries won’t save or sync until you sign in.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Sign in to save
              </Link>

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-400"
                title="Enabled after Firebase auth"
              >
                Sign out
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="text-sm font-medium">Danger zone</div>
              <p className="mt-1 text-sm text-neutral-600">
                Account deletion will be available after sign-in is connected.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex cursor-not-allowed rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-400"
              >
                Delete account
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200/70 p-4">
          <h2 className="text-sm font-semibold">Preferences</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Calm defaults, optional personalization.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ultra calm</span>
              <span className="text-xs text-neutral-500">Use Calm toggle</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Theme</span>
              <span className="text-xs text-neutral-500">Coming soon</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Export entries</span>
              <span className="text-xs text-neutral-500">Coming soon</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}