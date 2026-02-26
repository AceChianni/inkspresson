// src/app/app/page.tsx
export default function DashboardPage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Mood check-in + next action + recent entries.</p>

      <div className="mt-6 flex gap-3">
        <a className="rounded-xl bg-black px-4 py-2 text-white" href="/app/new">
          Start a journal entry
        </a>
        <a className="rounded-xl border border-neutral-300 px-4 py-2" href="/app/entries">
          View entries
        </a>
      </div>
    </main>
  );
}