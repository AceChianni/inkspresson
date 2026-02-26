// src/components/AppShell.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  title: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/entries", label: "Entries" },
  { href: "/app/settings", label: "Settings" },
] as const;

export default function AppShell({ title, children }: Props) {
  const pathname = usePathname();
  const [ultraCalm, setUltraCalm] = useState(false);

  // Persist preference
  useEffect(() => {
    const saved = window.localStorage.getItem("ink_ultra_calm");
    if (saved === "true") setUltraCalm(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ink_ultra_calm", String(ultraCalm));
  }, [ultraCalm]);

  return (
    <div
      className={[
        "min-h-screen text-neutral-900",
        ultraCalm ? "bg-neutral-50" : "bg-neutral-50/40",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop/tablet) */}
          <aside
            className={[
              "hidden md:block rounded-2xl bg-white p-5 shadow-sm",
              ultraCalm
                ? "border border-neutral-200/50"
                : "border border-neutral-200/70",
            ].join(" ")}
          >
            {/* Brand */}
            <div className="mb-6">
              <Link href="/" className="flex items-start gap-3">
                <span
                  className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
                      fill="none"
                      stroke="rgb(var(--ink-accent))"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <div className="text-2xl font-semibold tracking-tight leading-tight">
                    Inkspression
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Gentle journaling for busy brains
                  </div>
                </div>
              </Link>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <SideNavLink
                  key={item.href}
                  href={item.href}
                  active={pathname === item.href}
                >
                  {item.label}
                </SideNavLink>
              ))}
            </nav>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="font-medium text-neutral-900">Low pressure</div>
                <div className="mt-1">No streaks. No shame. Just return.</div>
              </div>

              <button
                type="button"
                onClick={() => setUltraCalm((v) => !v)}
                className={[
                  "w-full rounded-xl border px-3 py-2 text-sm transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ink-accent),0.25)]",
                  ultraCalm
                    ? "border-transparent text-white"
                    : "border-neutral-200 hover:bg-neutral-100",
                ].join(" ")}
                style={
                  ultraCalm
                    ? { backgroundColor: "rgb(var(--ink-accent))" }
                    : undefined
                }
                aria-pressed={ultraCalm}
              >
                {ultraCalm ? "Ultra calm: On" : "Ultra calm: Off"}
              </button>
            </div>
          </aside>

          {/* Main */}
          <main
            className={[
              "rounded-2xl bg-white p-4 shadow-sm md:p-6",
              ultraCalm ? "border border-neutral-200/50" : "border border-neutral-200/70",
            ].join(" ")}
          >
            {/* Mobile brand header */}
            <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
              <Link href="/" className="flex items-start gap-3">
                <span
                  className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
                      fill="none"
                      stroke="rgb(var(--ink-accent))"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <div className="text-lg font-semibold tracking-tight leading-tight">
                    Inkspression
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-600">
                    Gentle journaling
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setUltraCalm((v) => !v)}
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100"
                aria-pressed={ultraCalm}
              >
                Calm
              </button>
            </div>

            <header className="mb-5 flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">{title}</h1>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                  Demo mode
                </span>

                <Link
                  href="/auth"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100"
                >
                  Sign in
                </Link>
              </div>
            </header>

            {/* page content */}
            <div className="pb-16 md:pb-0">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden safe-bottom">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-xl px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ink-accent),0.25)]",
                  active ? "text-[rgb(var(--ink-accent))] font-medium" : "text-neutral-700",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SideNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700 hover:bg-neutral-100",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}