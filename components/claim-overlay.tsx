"use client";

import { Play } from "lucide-react";

interface ClaimOverlayProps {
  onClaim: () => void;
}

export default function ClaimOverlay({ onClaim }: ClaimOverlayProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 text-7xl animate-float">
        <span role="img" aria-label="gift">{"🎁"}</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
      <p className="text-slate-300 mb-8 text-lg">Tap to Claim Reward</p>
      <button
        onClick={onClaim}
        className="w-full max-w-xs bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-500/30 active:scale-95 transition flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" /> CLAIM REWARD
      </button>
    </div>
  );
}
