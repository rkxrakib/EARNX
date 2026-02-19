"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Clock } from "lucide-react";

const ICONS = [
  "apple", "carrot", "lemon", "pepper", "pizza", "ice-cream",
  "fish", "cat", "dog", "bird", "dragon", "ghost",
  "robot", "rocket", "car", "bike", "tree", "leaf", "flame", "droplet",
];

const ICON_EMOJIS: Record<string, string> = {
  apple: "🍎", carrot: "🥕", lemon: "🍋", pepper: "🌶️", pizza: "🍕",
  "ice-cream": "🍦", fish: "🐟", cat: "🐱", dog: "🐶", bird: "🐦",
  dragon: "🐉", ghost: "👻", robot: "🤖", rocket: "🚀", car: "🚗",
  bike: "🚲", tree: "🌳", leaf: "🍃", flame: "🔥", droplet: "💧",
};

interface ImageFinderGameProps {
  onClose: () => void;
  onWin: () => void;
}

export default function ImageFinderGame({ onClose, onWin }: ImageFinderGameProps) {
  const [winsInRow, setWinsInRow] = useState(0);
  const [timer, setTimer] = useState(30);
  const [targetIcon, setTargetIcon] = useState("");
  const [grid, setGrid] = useState<string[]>([]);
  const [flashCell, setFlashCell] = useState<{ idx: number; color: string } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setupLevel = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * ICONS.length);
    const target = ICONS[randomIdx];
    setTargetIcon(target);

    const cells: string[] = [target];
    for (let i = 1; i < 12; i++) {
      let wrong: string;
      do {
        wrong = ICONS[Math.floor(Math.random() * ICONS.length)];
      } while (wrong === target);
      cells.push(wrong);
    }
    cells.sort(() => Math.random() - 0.5);
    setGrid(cells);
  }, []);

  useEffect(() => {
    setupLevel();
  }, [setupLevel]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onClose]);

  function handleClick(icon: string, idx: number) {
    if (icon === targetIcon) {
      setFlashCell({ idx, color: "bg-emerald-500" });
      const newWins = winsInRow + 1;
      setWinsInRow(newWins);

      if (newWins >= 3) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => onWin(), 500);
      } else {
        setTimeout(() => {
          setTimer((p) => p + 5);
          setFlashCell(null);
          setupLevel();
        }, 400);
      }
    } else {
      setFlashCell({ idx, color: "bg-red-500" });
      setTimer((p) => Math.max(0, p - 5));
      setTimeout(() => setFlashCell(null), 300);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg z-10">
        <button
          onClick={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onClose();
          }}
          className="text-white/80 hover:text-white bg-white/10 w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Close game"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-white/70 uppercase font-bold tracking-wider">
            STREAK
          </span>
          <span className="font-extrabold text-white text-lg leading-none drop-shadow-md">
            {winsInRow}/3
          </span>
        </div>
        <div className="bg-black/30 border border-white/20 px-3 py-1 rounded-full text-sm font-mono font-bold text-white flex items-center gap-2">
          <Clock className="w-3 h-3" />{" "}
          00:{timer.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
        <div className="text-center mb-8 relative z-10">
          <p className="text-indigo-200 text-sm mb-3 font-bold uppercase tracking-wide">
            Find this icon
          </p>
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center border-4 border-[#0f172a] shadow-2xl shadow-indigo-500/30 mx-auto animate-bounce">
            <span className="text-5xl">
              {ICON_EMOJIS[targetIcon] || "?"}
            </span>
          </div>
        </div>

        <div className="game-grid w-full max-w-sm relative z-10">
          {grid.map((icon, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(icon, idx)}
              className={`game-cell group ${flashCell?.idx === idx ? flashCell.color : ""}`}
            >
              <span className="text-2xl group-hover:scale-110 transition">
                {ICON_EMOJIS[icon] || "?"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
