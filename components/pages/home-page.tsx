"use client";

import { useAuth } from "@/lib/auth-context";
import PaymentSlider from "@/components/payment-slider";
import { Search, Gamepad2, Play, Flame, Shapes } from "lucide-react";

interface HomePageProps {
  onStartImageFinder: () => void;
  onStartTicTacToe: () => void;
  onStartMath: () => void;
}

export default function HomePage({
  onStartImageFinder,
  onStartTicTacToe,
  onStartMath,
}: HomePageProps) {
  const { settings } = useAuth();

  return (
    <div className="page-transition">
      <PaymentSlider />

      {/* Hero Section */}
      <div
        onClick={onStartImageFinder}
        className="relative w-full h-52 rounded-3xl overflow-hidden mb-8 cursor-pointer shadow-xl shadow-indigo-900/30 group border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-start z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded mb-2 border border-white/10 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> POPULAR
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-1">
            Image
            <br />
            Finder
          </h2>
          <p className="text-indigo-100 text-xs mb-5 opacity-90 font-medium">
            Identify 3 icons correctly to win!
          </p>
          <button className="bg-white text-indigo-600 text-xs font-bold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 group-active:scale-95 transition hover:bg-indigo-50">
            <Play className="w-3 h-3" /> PLAY NOW
          </button>
        </div>
        <div className="absolute right-4 bottom-4">
          <Search className="w-16 h-16 text-white opacity-10 rotate-12 absolute top-0 right-0" />
          <Gamepad2 className="w-12 h-12 text-yellow-300 absolute bottom-2 right-2 animate-bounce drop-shadow-lg" />
        </div>
      </div>

      {/* More Games */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Shapes className="w-5 h-5 text-pink-400" /> More Games
        </h3>
      </div>

      <div className="space-y-3">
        {/* Tic Tac Toe */}
        <div
          onClick={onStartTicTacToe}
          className="glass-card p-3 rounded-xl flex items-center gap-4 cursor-pointer active:scale-95 transition group hover:border-green-500/50"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
            X
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white group-hover:text-green-400 transition">
              Tic Tac Toe
            </h4>
            <p className="text-[10px] text-slate-400">
              Beat AI & Win Rewards
            </p>
          </div>
          <button className="bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center group-hover:bg-green-600 transition shadow-lg">
            <Play className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Math Solve */}
        <div
          onClick={onStartMath}
          className="glass-card p-3 rounded-xl flex items-center gap-4 cursor-pointer active:scale-95 transition group hover:border-pink-500/50"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
            {"÷"}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white group-hover:text-pink-400 transition">
              Math Solve
            </h4>
            <p className="text-[10px] text-slate-400">
              Solve & Win Rewards
            </p>
          </div>
          <button className="bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center group-hover:bg-pink-600 transition shadow-lg">
            <Play className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Social Links */}
      {settings.socials && (
        <div className="mt-6 mb-4">
          <h3 className="font-bold text-sm text-white mb-3 px-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            Join Community
          </h3>
          <div className="flex justify-center gap-4 glass-card p-4 rounded-xl">
            {settings.socials.telegram && (
              <a
                href={settings.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
              </a>
            )}
            {settings.socials.youtube && (
              <a
                href={settings.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
            {settings.socials.instagram && (
              <a
                href={settings.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
