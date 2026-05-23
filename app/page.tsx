import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <div className="max-w-md">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
          GrowNow Presents
        </p>

        <h1 className="text-6xl font-black tracking-tight">
          GrowStack
        </h1>

        <p className="mt-4 text-lg text-zinc-400">
          Stack projects. Grow your freelance career. Reach the top of the live leaderboard.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/play"
            className="rounded-3xl bg-purple-600 px-8 py-5 text-xl font-black transition hover:bg-purple-500"
          >
            COMPETE
          </Link>

          <Link
            href="/leaderboard"
            className="rounded-3xl border border-white/15 px-8 py-5 text-xl font-black transition hover:bg-white/10"
          >
            LIVE LEADERBOARD
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Top score wins GrowNow merch.
        </p>
      </div>
    </main>
  );
}