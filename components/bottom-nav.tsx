"use client";

import { Home, Users, Wallet, UserCircle, Gamepad2 } from "lucide-react";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onPlayGame: () => void;
}

export default function BottomNav({ activePage, onNavigate, onPlayGame }: BottomNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "refer", label: "Refer", icon: Users },
    { id: "play", label: "", icon: Gamepad2 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <nav className="glass-nav fixed bottom-0 w-full pb-[env(safe-area-inset-bottom,8px)] pt-2 px-6 flex justify-between items-center z-40 h-[75px]">
      {navItems.map((item) => {
        if (item.id === "play") {
          return (
            <div key={item.id} className="relative -top-6">
              <button
                onClick={onPlayGame}
                className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-[#0f172a] active:scale-90 transition"
                aria-label="Play Game"
              >
                <Gamepad2 className="w-7 h-7 text-white" />
              </button>
            </div>
          );
        }

        const isActive = activePage === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 w-14 transition duration-300 ${
              isActive ? "text-indigo-400" : "text-slate-500"
            }`}
            aria-label={item.label}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-300 ${
                isActive ? "bg-indigo-500/10 text-indigo-400" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
