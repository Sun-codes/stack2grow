"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Score = {
  id: number;
  name: string;
  score: number;
  created_at?: string;
};

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([]);

  async function fetchScores() {
    const { data, error } = await supabase
      .from("scores")
      .select("id, name, score, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setScores(data ?? []);
  }

  useEffect(() => {
    fetchScores();

    const channel = supabase
      .channel("scores-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        () => fetchScores()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
            Live Competition
          </p>

          <h1 className="mt-4 text-6xl font-black tracking-tight md:text-7xl">
            GrowStack Leaderboard
          </h1>

          <p className="mt-4 text-xl text-zinc-400">
            Stack projects. Climb the ranks. Win GrowNow merch.
          </p>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl">
          <div className="grid grid-cols-[90px_1fr_140px] border-b border-white/10 px-6 pb-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
            <p>Rank</p>
            <p>Name</p>
            <p className="text-right">Score</p>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {scores.length === 0 && (
              <div className="py-16 text-center text-xl font-bold text-zinc-500">
                No scores yet. Be the first builder.
              </div>
            )}

            {scores.map((player, index) => (
              <div
                key={player.id}
                className={`grid grid-cols-[90px_1fr_140px] items-center rounded-3xl px-6 py-5 ${
                  index === 0
                    ? "bg-purple-600/25 ring-1 ring-purple-400/40"
                    : "bg-white/[0.03]"
                }`}
              >
                <p className="text-3xl font-black">
                  {index === 0 ? "🏆" : `#${index + 1}`}
                </p>

                <div>
                  <p className="text-2xl font-black">{player.name}</p>
                  <p className="text-sm text-zinc-400">Freelance Builder</p>
                </div>

                <p className="text-right text-4xl font-black text-green-400">
                  {player.score}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
          <p className="text-lg text-zinc-400">LIVE updating leaderboard</p>
        </div>
      </div>
    </main>
  );
}