"use client";
import {
  getSphere,
  connectSphereWallet,
  disconnectSphereWallet,
} from "@/lib/sphere";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type Choice = "Heads" | "Tails";

type HistoryItem = {
  id: number;
  choice: Choice;
  result: Choice;
  bet: number;
  won: boolean;
};

export default function Home() {
  const flipSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [bet, setBet] = useState("10");
  const [balance, setBalance] = useState(100);
  const [coin, setCoin] = useState("🪙");
  const [message, setMessage] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);


useEffect(() => {
  try {
    const saved = localStorage.getItem("coinflip-data");

    if (!saved) return;

    const data = JSON.parse(saved);

    setBalance(data.balance ?? 100);
    setWins(data.wins ?? 0);
    setLosses(data.losses ?? 0);
    setHistory(data.history ?? []);
    setStreak(data.streak ?? 0);
    setBestStreak(data.bestStreak ?? 0);
  } catch (error) {
    console.error("Failed to load saved game data:", error);
  }
}, []);


useEffect(() => {
  flipSound.current = new Audio("/flip.mp3");
  winSound.current = new Audio("/win.mp3");
}, []);


useEffect(() => {
  const gameData = {
    balance,
    wins,
    losses,
    history,
    streak,
    bestStreak,
  };

  localStorage.setItem(
    "coinflip-data",
    JSON.stringify(gameData)
  );
}, [balance, wins, losses, history, streak, bestStreak]);


async function connectWallet() {
  setLoadingWallet(true);

  try {
    const result = await connectSphereWallet();

    console.log("Sphere Connect result:", result);
    console.log("Transport:", result.transport);
    console.log("Connection:", result.connection);
    console.log("Wallet identity:", result.connection.identity);

    const identity = result.connection.identity;

    if (identity.directAddress) {
      setWalletAddress(identity.directAddress);
    } else {
      setWalletAddress(identity.chainPubkey);
    }

    setConnected(true);

  } catch (err) {
    console.error("Sphere Connect failed:", err);
    alert("Wallet connection was cancelled or failed.");
  } finally {
    setLoadingWallet(false);
  }
}


async function disconnectWallet() {
  setLoadingWallet(true);

  try {
    await disconnectSphereWallet();

    setConnected(false);
    setWalletAddress("");

  } catch (err) {
    console.error(err);
    alert("Failed to disconnect wallet.");
  } finally {
    setLoadingWallet(false);
  }
}


async function refreshBalance() {
  const sphere = await getSphere();

}

function playGame() {
  if (flipping) return;

  if (!connected) {
    alert("Please connect your Sphere wallet first.");
    return;
  }

  if (!choice) {
    alert("Please choose Heads or Tails.");
    return;
  }

  const betAmount = Number(bet);

  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    alert("Enter a valid game-points amount.");
    return;
  }

  if (betAmount > balance) {
    alert("Insufficient game points.");
    return;
  }

  setFlipping(true);
  setMessage("");

  if (flipSound.current) {
    flipSound.current.pause();
    flipSound.current.currentTime = 0;
    void flipSound.current.play().catch(() => {});
  }

  const animation = setInterval(() => {
    setCoin((prev) => (prev === "🪙" ? "⚪" : "🪙"));
  }, 120);

  setTimeout(() => {
    clearInterval(animation);

    const flip: Choice =
      Math.random() < 0.5 ? "Heads" : "Tails";

    const won = flip === choice;

    setCoin(flip === "Heads" ? "🙂" : "🦅");

    if (won) {
      setBalance((b) => b + betAmount);
      setWins((w) => w + 1);

      const nextStreak = streak + 1;

setStreak(nextStreak);

setBestStreak((best) =>
  Math.max(best, nextStreak)
);

      if (winSound.current) {
        winSound.current.pause();
        winSound.current.currentTime = 0;
        void winSound.current.play().catch(() => {});
      }

      setMessage(
        `🎉 ${flip}! You won ${betAmount} game points!`
      );
    } else {
      setBalance((b) => b - betAmount);
      setLosses((l) => l + 1);
      setStreak(0);

      setMessage(
        `❌ ${flip}! You lost ${betAmount} game points.`
      );
    }

    setHistory((prev) => [
      {
        id: Date.now(),
        choice,
        result: flip,
        bet: betAmount,
        won,
      },
      ...prev,
    ]);

    setFlipping(false);
  }, 2000);
}
const totalGames = wins + losses;

const winRate =
  totalGames === 0
    ? 0
    : Math.round((wins / totalGames) * 100);

  return (
    <main className="min-h-screen text-white flex justify-center py-10 px-4">

      <div className="w-full max-w-lg">

        <div className="bg-slate-900 rounded-2xl shadow-xl p-8">

        <div className="mb-8 flex flex-col items-center text-center">
  <div className="flex items-center justify-center gap-4">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
      <img
        src="/sphere-logo.png"
        alt="Unicity Sphere"
        className="h-full w-full object-contain"
      />
    </div>

    <div className="text-left">
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Coin Flip Arena
      </h1>

      <p className="mt-1 text-sm font-medium text-cyan-300">
        Powered by Unicity Sphere
      </p>
    </div>
  </div>

  <div className="mt-5 h-px w-full bg-linear-to-r from-transparent via-cyan-400/40 to-transparent" />

  <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
    Choose your side, flip the coin, and test your luck on the Unicity
    testnet.
  </p>
</div>


  <button
  onClick={connected ? disconnectWallet : connectWallet}
  disabled={loadingWallet}
  className={`w-full rounded-lg py-3 font-semibold transition ${
    connected
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {loadingWallet
    ? "Please wait..."
    : connected
    ? "🔴 Disconnect Wallet"
    : "🔵 Connect Wallet"}
</button>



<div className="mt-6 rounded-2xl bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 shadow-2xl">

  <div className="flex justify-between items-start">

    <div>
      <p className="text-sm opacity-80">
        Wallet Balance
      </p>

      <h2 className="mt-2 text-4xl font-extrabold">
  {connected ? balance : "—"}
</h2>

<p className="text-lg opacity-90">
  {connected ? "Game Points" : "Connect wallet to view balance"}
</p>
    </div>

    <div className="text-right">
      <div className="text-5xl">💰</div>

      {connected && (
        <div className="mt-3 rounded-full bg-green-500 px-3 py-1 text-sm font-bold">
          🟢 Connected
        </div>
      )}
    </div>

  </div>

  {connected && (
    <div className="mt-6 rounded-xl bg-black/20 p-4">

      <p className="text-xs opacity-70">
        Wallet Address
      </p>

      <p className="mt-1 break-all font-mono text-green-200">
        {walletAddress}
      </p>

    </div>
  )}

</div>

</div>
<div className="text-center mt-8">
  <div className="flex justify-center">
    <img
  src="/coin.png"
  alt="Coin"
  width={140}
  height={140}
  className={`${flipping ? "coin-spin" : ""} coin-glow`}
/>
  </div>

  {flipping && (
    <p className="text-yellow-400 mt-4 animate-pulse">
      Flipping...
    </p>
  )}
</div>

          <div className="mt-8">

            <p className="font-semibold mb-3">
              Choose a Side
            </p>

            <div className="grid grid-cols-2 gap-4">

              <button
                onClick={() => setChoice("Heads")}
                className={`py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
  choice === "Heads"
    ? "bg-yellow-400 text-black scale-105 shadow-lg"
    : "bg-slate-700 hover:bg-slate-600 hover:scale-105"
}`}
              >
                Heads
              </button>

              <button
                onClick={() => setChoice("Tails")}
                className={`py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
  choice === "Tails"
    ? "bg-yellow-400 text-black scale-105 shadow-lg"
    : "bg-slate-700 hover:bg-slate-600 hover:scale-105"
}`}
              >
                Tails
              </button>

            </div>

          </div>

          <div className="mt-6">

            <label className="font-semibold">
              Bet Amount
            </label>

            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none"
            />

          </div>

          <button
  onClick={playGame}
  disabled={flipping}
  className="mt-8 w-full rounded-xl bg-linear-to-r from-green-500 to-emerald-600 py-4 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-green-500/40 disabled:scale-100 disabled:opacity-60"
>
  {flipping ? "🪙 Flipping..." : "🎲 Flip Coin"}
</button>

          <button
onClick={() => {
  setBalance(100);
  setWins(0);
  setLosses(0);
  setHistory([]);
  setStreak(0);
  setBestStreak(0);
  setMessage("");
  localStorage.removeItem("coinflip-data");
}}
  className="mt-3 w-full rounded-lg bg-red-600 py-3 font-bold hover:bg-red-700"
>
  Reset Game
</button>

         {message && (
  <div
    className={`mt-6 rounded-xl p-5 text-center shadow-lg animate-pulse ${
      message.includes("won")
        ? "bg-green-600/20 border border-green-500"
        : "bg-red-600/20 border border-red-500"
    }`}
  >
    <h3 className="text-xl font-bold">
      {message.includes("won") ? "🎉 Victory!" : "💀 Defeat"}
    </h3>

    <p className="mt-3 text-lg">{message}</p>
  </div>
)}

        <div className="grid grid-cols-2 gap-4 mt-6">

  <div className="bg-slate-900 rounded-xl p-4">
    <h3 className="text-lg font-bold">Wins</h3>
    <p className="text-3xl text-green-400 mt-2">{wins}</p>
  </div>

<div className="mt-4 rounded-xl bg-slate-900 p-5 text-center">
  <h3 className="text-lg font-bold">
    🎮 Total Games
  </h3>

  <p className="mt-2 text-3xl font-bold text-cyan-400">
    {totalGames}
  </p>

  <p className="mt-1 text-sm text-slate-400">
    Games played
  </p>
</div>


  <div className="bg-slate-900 rounded-xl p-4">
    <h3 className="text-lg font-bold">Losses</h3>
    <p className="text-3xl text-red-400 mt-2">{losses}</p>
  </div>

</div>

<div className="grid grid-cols-2 gap-4 mt-4">

  <div className="bg-orange-500 rounded-xl p-4 text-center">
    <h3 className="font-bold">🔥 Current Streak</h3>
    <p className="text-3xl font-bold mt-2">{streak}</p>
  </div>

  <div className="bg-purple-600 rounded-xl p-4 text-center">
    <h3 className="font-bold">🏆 Best Streak</h3>
    <p className="text-3xl font-bold mt-2">{bestStreak}</p>
  </div>

</div>

<div className="bg-slate-900 rounded-xl p-6 mt-4">

  <h2 className="text-xl font-bold mb-4">
    🏅 Achievement
  </h2>

  {bestStreak >= 10 ? (
    <div className="text-green-400 font-bold">
      👑 Coin Master Unlocked
    </div>
  ) : bestStreak >= 5 ? (
    <div className="text-yellow-400 font-bold">
      ⭐ Lucky Player
    </div>
  ) : (
    <div className="text-gray-400">
      Win 5 games in a row to unlock achievements.
    </div>
  )}

</div>


<div className="mt-4 rounded-xl bg-slate-900 p-4 text-center">
  <h3 className="text-lg font-bold">
    Win Rate
  </h3>

  <p className="mt-2 text-3xl font-bold text-cyan-400">
    {winRate}%
  </p>

  <p className="mt-1 text-sm text-slate-400">
    {wins} wins out of {totalGames} games
  </p>
</div>

        </div>

        <div className="bg-slate-900 rounded-xl p-6 h-130 overflow-y-auto">

          <h2 className="text-2xl font-bold mb-4">
            Game History
          </h2>

          {history.length === 0 ? (

            <p className="text-gray-400">
              No games played yet.
            </p>

          ) : (

            <div className="space-y-3">

              {history.map((game) => (

  <div
    key={game.id}
    className="bg-slate-800 rounded-lg p-3 flex justify-between items-center"
  >

    <div>

      <p className="font-bold">
        {game.choice} → {game.result}
      </p>

      <p className="text-sm text-gray-400">
        Bet {game.bet} game points
      </p>

    </div>

    <div
      className={`text-xl font-bold ${
        game.won
          ? "text-green-400"
          : "text-red-400"
      }`}
    >
      {game.won ? `+${game.bet}` : `-${game.bet}`}
    </div>

  </div>

))}       
         </div>
           

          )}

        </div>

{flipping && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="text-center">
      <Image
        src="/coin.png"
        alt="Coin"
        width={180}
        height={180}
         className="coin-spin coin-glow"
      />
      <p className="mt-6 text-2xl font-bold text-yellow-400">
        Flipping Coin...
      </p>
    </div>
  </div>
)}
{loadingWallet && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
    <div className="text-center">
      <Image
        src="/coin.png"
        alt="Loading"
        width={120}
        height={120}
        className="coin-spin"
      />

      <p className="mt-6 text-xl font-bold text-white">
        Connecting Wallet...
      </p>
    </div>
  </div>
)}
    </main>
  );
}