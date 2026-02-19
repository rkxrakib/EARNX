"use client";

import { useAuth } from "@/lib/auth-context";

export default function AppHeader() {
  const { userData, activeUsers } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 pt-6 bg-gradient-to-b from-slate-900 via-slate-900 to-transparent z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.firstName || "G")}&background=random`}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-[#0f172a]"
            crossOrigin="anonymous"
          />
        </div>
        <div>
          <h2 className="font-bold text-sm leading-tight text-white">
            {userData?.firstName || "Guest"}
          </h2>
          <span className="text-[10px] text-slate-400">Welcome back!</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="glass-card px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10">
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          <span className="font-bold text-white text-xs">
            {userData?.balance || 0}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
          <div className="pulse-dot" />
          <span className="text-[9px] text-slate-300 font-mono">
            {activeUsers || "..."} Online
          </span>
        </div>
      </div>
    </header>
  );
}
