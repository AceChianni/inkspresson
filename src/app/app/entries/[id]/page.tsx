// src/app/app/entries/[id]/page.tsx
import EntryDetailClient from "./EntryDetailClient";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntryDetailClient id={id} />;
}