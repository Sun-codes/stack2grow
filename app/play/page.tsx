"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const deathMessages = [
  "Scope creep collapsed the stack.",
  "Client minta revisi.",
  "Kelewat deadline.",
  "Budget got cut.",
  "Revisi ke-19 broke the tower.",
  "The project requirements shifted mid-air.",
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [deathMessage, setDeathMessage] = useState("");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Block = {
      x: number;
      y: number;
      width: number;
      height: number;
    };

    const blockHeight = 28;
    const baseWidth = Math.min(190, canvas.width * 0.48);
    const inputCooldownMs = 280;

    const centerX = canvas.width / 2 - baseWidth / 2;

    const blocks: Block[] = [
      {
        x: centerX,
        y: canvas.height - 90,
        width: baseWidth,
        height: blockHeight,
      },
    ];

    let current: Block = {
      x: 0,
      y: canvas.height - 90 - blockHeight,
      width: baseWidth,
      height: blockHeight,
    };

    let direction = 1;
    let speed = 4;
    let score = 0;
    let cameraOffset = 0;
    let isGameOver = false;
    let lastInputTime = 0;

    function triggerGameOver() {
      if (isGameOver) return;

      isGameOver = true;
      setFinalScore(score);
      setDeathMessage(
        deathMessages[Math.floor(Math.random() * deathMessages.length)]
      );
      setGameOver(true);
    }

    function placeBlock() {
      if (isGameOver) return;

      const previous = blocks[blocks.length - 1];

      const overlapLeft = Math.max(current.x, previous.x);
      const overlapRight = Math.min(
        current.x + current.width,
        previous.x + previous.width
      );

      const overlapWidth = overlapRight - overlapLeft;

      if (overlapWidth <= 0) {
        triggerGameOver();
        return;
      }

      current.x = overlapLeft;
      current.width = overlapWidth;

      blocks.push({ ...current });
      score++;

      const nextY = current.y - blockHeight;

      current = {
        x: direction === 1 ? -current.width : canvas.width,
        y: nextY,
        width: current.width,
        height: blockHeight,
      };

      direction *= -1;
      speed = Math.min(speed + 0.25, 9);

      if (current.y - cameraOffset < canvas.height * 0.35) {
        cameraOffset -= blockHeight;
      }
    }

    function handleInput(event: Event) {
  const target = event.target as HTMLElement;

  if (
    target.tagName === "INPUT" ||
    target.tagName === "BUTTON" ||
    target.tagName === "A"
  ) {
    return;
  }

  if (event.type === "touchstart") {
    event.preventDefault();
  }

  const now = Date.now();

  if (now - lastInputTime < inputCooldownMs) return;

  lastInputTime = now;
  placeBlock();
}

    window.addEventListener("keydown", handleInput);
    window.addEventListener("touchstart", handleInput, { passive: false });
    window.addEventListener("mousedown", handleInput);

    function drawBlock(block: Block, index: number, isCurrent = false) {
      const y = block.y - cameraOffset;

      const gradient = ctx.createLinearGradient(
        block.x,
        y,
        block.x + block.width,
        y + block.height
      );

      gradient.addColorStop(0, isCurrent ? "#a855f7" : "#22c55e");
      gradient.addColorStop(1, isCurrent ? "#7c3aed" : "#16a34a");

      ctx.fillStyle = gradient;
      ctx.fillRect(block.x, y, block.width, block.height);

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(block.x, y, block.width, 5);

      ctx.fillStyle = "white";
      ctx.font = "bold 11px sans-serif";

      ctx.fillText(
        index === 0 ? "GrowNow Base" : `Project ${index}`,
        block.x + 8,
        y + 19
      );
    }

    function drawBackground() {
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);

      bg.addColorStop(0, "#14051f");
      bg.addColorStop(0.5, "#09090b");
      bg.addColorStop(1, "#03130b");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.35,
        20,
        canvas.width / 2,
        canvas.height * 0.35,
        canvas.width * 0.8
      );

      glow.addColorStop(0, "rgba(168,85,247,0.22)");
      glow.addColorStop(1, "rgba(168,85,247,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(168,85,247,0.08)";

      for (let i = 0; i < 18; i++) {
        ctx.beginPath();

        ctx.arc(
          (i * 97) % canvas.width,
          (i * 173 + Date.now() * 0.015) % canvas.height,
          2,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();

      if (!isGameOver) {
        current.x += speed * direction;

        if (current.x <= 0) {
          current.x = 0;
          direction = 1;
        }

        if (current.x + current.width >= canvas.width) {
          current.x = canvas.width - current.width;
          direction = -1;
        }
      }

      blocks.forEach((block, index) => drawBlock(block, index));
      drawBlock(current, blocks.length, true);

      ctx.fillStyle = "white";
      ctx.font = "bold 42px sans-serif";
      ctx.fillText(score.toString(), 28, 64);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "14px sans-serif";
      ctx.fillText("Tap anywhere to lock the project", 28, 90);

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("keydown", handleInput);
      window.removeEventListener("touchstart", handleInput);
      window.removeEventListener("mousedown", handleInput);
    };
  }, []);

  async function handleSubmit() {
    const cleanName = playerName.trim();

    if (!cleanName) {
      alert("Enter your name first.");
      return;
    }

    const bannedWords = [
      "fuck",
      "shit",
      "bitch",
      "kontol",
      "memek",
      "anjing",
      "ngentot",
      "nigga",
      "nigger",
      "asshole",
      "motherfucker",
    ];

    const lowerName = cleanName.toLowerCase();
    const isBadName = bannedWords.some((word) => lowerName.includes(word));

    if (isBadName) {
      alert("Invalid name.");
      return;
    }

    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("name", cleanName)
      .single();

    if (existing) {
      if (finalScore > existing.score) {
        const { error } = await supabase
          .from("scores")
          .update({ score: finalScore })
          .eq("id", existing.id);

        if (error) {
          console.error(error);
          alert("Failed to update score.");
          return;
        }
      } else {
        alert("You already have a higher score.");
        return;
      }
    } else {
      const { error } = await supabase.from("scores").insert({
        name: cleanName,
        score: finalScore,
      });

      if (error) {
        console.error(error);
        alert("Failed to submit score.");
        return;
      }
    }

    window.location.href = "/leaderboard";
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} />

      <div className="pointer-events-none absolute left-0 top-0 w-full p-5 text-white">
        <div className="inline-flex rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
          <div>
            <h1 className="text-lg font-black tracking-tight">GrowStack</h1>

            <p className="text-xs text-zinc-400">
              Stack projects. Build your career.
            </p>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center text-white shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
              Game Over
            </p>

            <h1 className="mt-3 text-3xl font-black">{deathMessage}</h1>

            <p className="mt-4 text-zinc-400">Projects Completed</p>

            <p className="text-6xl font-black text-green-400">{finalScore}</p>

<a
  href="https://grownow1-0-0.vercel.appE"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 block w-full rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-green-300 transition hover:bg-green-500/20"
>
  Visit GrowNow!
</a>

<p className="mt-5 text-sm font-bold text-zinc-400">
  Enter your name to save your score
</p>

<input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={16}
              className="mt-6 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-center text-lg font-bold text-black outline-none"
            />

            <button
              onClick={handleSubmit}
              className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-lg font-black transition hover:bg-purple-500"
            >
              Submit Score
            </button>

            <button
              onClick={() => window.location.reload()}
              className="mt-3 w-full rounded-2xl border border-white/10 py-3 font-bold text-zinc-300"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}