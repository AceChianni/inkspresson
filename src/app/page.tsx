export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-semibold">Inkspression</h1>
      <p className="mt-3 max-w-xl text-neutral-600">
        A neurodivergent-friendly journaling app designed to reduce overwhelm through gentle
        structure, emotional check-ins, and low-cognitive-load design.
      </p>

      <div className="mt-8 flex gap-3">
        <a className="rounded-xl bg-black px-4 py-2 text-white" href="/auth">
          Sign in
        </a>
        <a className="rounded-xl border border-neutral-300 px-4 py-2" href="/app">
          Open app
        </a>
      </div>
    </main>
  );
}