// src/app/app/entries/[id]/page.tsx
import EntryDetailClient from "./EntryDetailClient";

export default function EntryDetailPage({ params }: { params: { id: string } }) {
  return <EntryDetailClient id={params.id} />;
}