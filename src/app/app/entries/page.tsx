// src/app/app/entries/page.tsx

import AppShell from "@/components/AppShell";

export default function EntriesPage() {
  return (
    <AppShell title="Entries">
      <div className="rounded-2xl border border-neutral-200 p-4">
        <p className="text-sm text-neutral-600">
          Next: Firestore list + search + filters.
        </p>
      </div>
    </AppShell>
  );
}