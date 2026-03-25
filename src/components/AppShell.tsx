// /components/AppShell.tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  title: string;
  children: React.ReactNode;
};

type Mode = "light" | "dark";
type ThemeName = "sand" | "sage" | "dusk" | "rose";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/entries", label: "Entries" },
  { href: "/app/settings", label: "Settings" },
] as const;

const isThemeName = (value: string | null): value is ThemeName =>
  value === "sand" || value === "sage" || value === "dusk" || value === "rose";

const isMode = (value: string | null): value is Mode =>
  value === "light" || value === "dark";

export default function AppShell({ title, children }: Props) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const pageHeadingId = useId();

  const [mode, setMode] = useState<Mode>("light");
  const [theme, setTheme] = useState<ThemeName>("sand");
  const [ready, setReady] = useState(false);
  const [showMobileAppearance, setShowMobileAppearance] = useState(false);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("ink_mode");
    const savedTheme = window.localStorage.getItem("ink_theme");

    const initialMode: Mode = isMode(savedMode)
      ? savedMode
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const initialTheme: ThemeName = isThemeName(savedTheme) ? savedTheme : "sand";

    setMode(initialMode);
    setTheme(initialTheme);

    document.documentElement.setAttribute("data-mode", initialMode);
    document.documentElement.setAttribute("data-theme", initialTheme);

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("ink_mode", mode);
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("ink_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, ready]);

  const ultraCalm = mode === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[100] -translate-y-20 rounded-xl px-4 py-2 text-sm font-medium shadow-md transition focus:translate-y-0 focus-visible:translate-y-0"
        style={{
          background: "rgb(var(--ink-surface))",
          color: "rgb(var(--ink-text))",
          border: "1px solid rgb(var(--ink-border))",
        }}
      >
        Skip to main content
      </a>

      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          <aside
            className="hidden rounded-2xl p-5 shadow-sm md:block"
            style={{
              background: "rgb(var(--ink-surface))",
              border: "1px solid rgb(var(--ink-border))",
            }}
            aria-label="Sidebar"
          >
            <div className="mb-6">
              <Link href="/" className="flex items-start gap-3">
                <span
                  className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{
                    border: "1px solid rgb(var(--ink-border))",
                    background: "rgb(var(--ink-surface-soft))",
                  }}
                  aria-hidden="true"
                >
                  🌙
                </span>

                <div>
                  <div className="text-2xl font-semibold tracking-tight">
                    Inkspression
                  </div>
                  <div className="mt-1 text-sm ink-muted">
                    Gentle journaling for busy brains
                  </div>
                </div>
              </Link>
            </div>

            <nav className="space-y-1" aria-label="Primary">
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

            <AppearanceControls
              className="mt-8"
              ultraCalm={ultraCalm}
              theme={theme}
              onToggleMode={() => setMode((m) => (m === "light" ? "dark" : "light"))}
              onThemeChange={setTheme}
            />
          </aside>

          <main
            id="main-content"
            className="rounded-2xl p-4 shadow-sm md:p-6"
            style={{
              background: "rgb(var(--ink-surface))",
              border: "1px solid rgb(var(--ink-border))",
            }}
            aria-labelledby={pageHeadingId}
          >
            <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 id={pageHeadingId} className="text-xl font-semibold">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobileAppearance((v) => !v)}
                  aria-expanded={showMobileAppearance}
                  aria-controls="mobile-appearance-panel"
                  className="md:hidden inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
                  style={{
                    background: showMobileAppearance
                      ? "rgb(var(--ink-surface-soft))"
                      : "rgb(var(--ink-surface))",
                    border: "1px solid rgb(var(--ink-border))",
                    color: "rgb(var(--ink-text))",
                    boxShadow: "var(--ink-shadow-sm)",
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(var(--ink-accent), 0.12)",
                      border: "1px solid rgba(var(--ink-accent), 0.18)",
                      color: "rgb(var(--ink-text))",
                      fontSize: "0.7rem",
                    }}
                    aria-hidden="true"
                  >
                    ✦
                  </span>

                  Appearance

                  <span
                    aria-hidden="true"
                    style={{
                      transform: showMobileAppearance ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 180ms ease",
                      color: "rgb(var(--ink-text-soft))",
                    }}
                  >
                    ▾
                  </span>
                </button>

                {loading ? (
                  <span className="text-xs ink-muted">Checking…</span>
                ) : user ? (
                  <>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        border: "1px solid rgb(var(--ink-border))",
                        background: "rgb(var(--ink-surface-soft))",
                        color: "rgb(var(--ink-text-soft))",
                      }}
                    >
                      Signed in
                    </span>

                    <button
                      type="button"
                      onClick={() => signOut(auth)}
                      className="ink-btn ink-btn-secondary"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="ink-btn ink-btn-secondary">
                    Sign in
                  </Link>
                )}
              </div>
            </header>

            <div
              id="mobile-appearance-panel"
              className="overflow-hidden md:hidden"
              style={{
                maxHeight: showMobileAppearance ? "420px" : "0px",
                opacity: showMobileAppearance ? 1 : 0,
                marginBottom: showMobileAppearance ? "1.25rem" : "0rem",
                transition:
                  "max-height 260ms ease, opacity 180ms ease, margin-bottom 180ms ease",
              }}
            >
              <div
                className="rounded-2xl p-1"
                style={{
                  background: "rgba(var(--ink-accent), 0.05)",
                  border: "1px solid rgb(var(--ink-border))",
                  boxShadow: "var(--ink-shadow-sm)",
                }}
              >
                <AppearanceControls
                  ultraCalm={ultraCalm}
                  theme={theme}
                  onToggleMode={() =>
                    setMode((m) => (m === "light" ? "dark" : "light"))
                  }
                  onThemeChange={setTheme}
                  mobile
                />
              </div>
            </div>

            <div className="pb-16 md:pb-0">{children}</div>
          </main>
        </div>
      </div>

      <nav
  className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
  style={{
    borderTop: "1px solid rgb(var(--ink-border))",
    background: "rgb(var(--ink-surface))",
    boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.06)",
  }}
  aria-label="Mobile navigation"
>
  <div className="safe-bottom grid grid-cols-3 gap-2 px-3 py-2">
    {navItems.map((item) => {
      const active = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className="flex min-h-[52px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition"
          style={{
            color: active
              ? "rgb(var(--ink-text))"
              : "rgb(var(--ink-text-soft))",
            fontWeight: active ? 600 : 500,
            background: active
              ? "rgb(var(--ink-surface-soft))"
              : "transparent",
            border: active
              ? "1px solid rgb(var(--ink-border))"
              : "1px solid transparent",
            boxShadow: active ? "var(--ink-shadow-sm)" : "none",
          }}
        >
          <span
            className="mb-1 h-1.5 w-1.5 rounded-full"
            style={{
              background: active
                ? "rgb(var(--ink-accent))"
                : "transparent",
            }}
            aria-hidden="true"
          />
          <span className="text-[0.8rem] leading-none">{item.label}</span>
        </Link>
      );
    })}
  </div>
</nav>
    </div>
  );
}

function AppearanceControls({
  ultraCalm,
  theme,
  onToggleMode,
  onThemeChange,
  className = "",
  mobile = false,
}: {
  ultraCalm: boolean;
  theme: ThemeName;
  onToggleMode: () => void;
  onThemeChange: (theme: ThemeName) => void;
  className?: string;
  mobile?: boolean;
}) {
  const themeOptions: {
    value: ThemeName;
    label: string;
    swatch: string;
  }[] = [
    { value: "sand", label: "Sand", swatch: "rgb(122 92 72)" },
    { value: "sage", label: "Sage", swatch: "rgb(92 120 104)" },
    { value: "dusk", label: "Dusk", swatch: "rgb(111 102 163)" },
    { value: "rose", label: "Rose", swatch: "rgb(154 96 110)" },
  ];

  return (
    <div className={className}>
      {!mobile ? (
        <div
          className="rounded-2xl p-4 text-sm"
          style={{
            background: "rgb(var(--ink-surface-soft))",
            color: "rgb(var(--ink-text-soft))",
            border: "1px solid rgb(var(--ink-border))",
            boxShadow: "var(--ink-shadow-sm)",
          }}
        >
          <div
            style={{
              color: "rgb(var(--ink-text))",
              fontWeight: 600,
            }}
          >
            Low pressure
          </div>
          <div className="mt-1">No streaks. No shame. Just return.</div>
        </div>
      ) : null}

      <div className="space-y-4">
        <section
          className="rounded-2xl p-4"
          style={{
            background: "rgb(var(--ink-surface))",
            border: "1px solid rgb(var(--ink-border))",
            boxShadow: "var(--ink-shadow-sm)",
          }}
        >
          <div className="mb-3">
            <div
              className="text-xs font-medium uppercase tracking-[0.14em]"
              style={{ color: "rgb(var(--ink-text-soft))" }}
            >
              Display mode
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMode}
            aria-pressed={ultraCalm}
            aria-label={`Ultra calm mode ${ultraCalm ? "on" : "off"}`}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition"
            style={{
              background: "rgb(var(--ink-surface-soft))",
              border: "1px solid rgb(var(--ink-border))",
              boxShadow: "var(--ink-shadow-sm)",
            }}
          >
            <span className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: "rgba(var(--ink-accent), 0.12)",
                  border: "1px solid rgba(var(--ink-accent), 0.18)",
                  color: "rgb(var(--ink-text))",
                }}
                aria-hidden="true"
              >
                🌙
              </span>

              <span>
                <span
                  className="block text-sm font-medium"
                  style={{ color: "rgb(var(--ink-text))" }}
                >
                  Ultra calm
                </span>
                <span
                  className="block text-xs"
                  style={{ color: "rgb(var(--ink-text-soft))" }}
                >
                  Softer, darker focus mode
                </span>
              </span>
            </span>

            <span
              className="relative inline-flex h-7 w-12 items-center rounded-full transition"
              style={{
                background: ultraCalm
                  ? "rgb(var(--ink-accent))"
                  : "rgb(var(--ink-border))",
              }}
              aria-hidden="true"
            >
              <span
                className="absolute h-5 w-5 rounded-full transition"
                style={{
                  left: ultraCalm ? "1.45rem" : "0.2rem",
                  background: "rgb(var(--ink-surface))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                }}
              />
            </span>
          </button>
        </section>

        <section
          className="rounded-2xl p-4"
          style={{
            background: "rgb(var(--ink-surface))",
            border: "1px solid rgb(var(--ink-border))",
            boxShadow: "var(--ink-shadow-sm)",
          }}
        >
          <div className="mb-3">
            <div
              className="text-xs font-medium uppercase tracking-[0.14em]"
              style={{ color: "rgb(var(--ink-text-soft))" }}
            >
              Color theme
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((option) => {
              const selected = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onThemeChange(option.value)}
                  aria-pressed={selected}
                  className="rounded-2xl px-3 py-3 text-left transition"
                  style={{
                    background: selected
                      ? "rgb(var(--ink-surface-soft))"
                      : "rgb(var(--ink-surface))",
                    border: selected
                      ? "1px solid rgb(var(--ink-accent))"
                      : "1px solid rgb(var(--ink-border))",
                    boxShadow: selected ? "var(--ink-shadow-sm)" : "none",
                  }}
                >
                  <span className="mb-2 flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: option.swatch }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--ink-text))" }}
                    >
                      {option.label}
                    </span>
                  </span>

                  <span
                    className="block text-xs"
                    style={{ color: "rgb(var(--ink-text-soft))" }}
                  >
                    {selected ? "Selected" : "Tap to apply"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
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
      aria-current={active ? "page" : undefined}
      className="block rounded-xl px-3 py-2 text-sm transition"
      style={{
        background: active ? "rgb(var(--ink-surface-soft))" : "transparent",
        color: active ? "rgb(var(--ink-text))" : "rgb(var(--ink-text-soft))",
        border: active
          ? "1px solid rgb(var(--ink-border))"
          : "1px solid transparent",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </Link>
  );
}