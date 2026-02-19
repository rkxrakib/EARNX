"use client";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useState } from "react";
import { Gift, Copy, Send } from "lucide-react";

export default function ReferPage() {
  const { userData, settings, processReferral } = useAuth();
  const { showToast } = useToast();
  const [manualCode, setManualCode] = useState("");

  function copyRefCode() {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode);
      showToast("Code Copied!", "success");
    }
  }

  function shareOnTelegram() {
    if (!userData) return;
    const botLink = `https://t.me/Earnfast11_bot?startapp=${userData.referralCode}`;
    const text = `Join EarnFast & get ${settings.signupBonus} Coins Bonus!\nPlay Games & Earn Money.\n\nClick here:\n${botLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  async function redeemManualReferral() {
    if (!manualCode.trim()) return showToast("Enter a code", "error");
    try {
      await processReferral(manualCode);
      showToast(`Bonus: +${settings.signupBonus} Coins!`, "success");
      setManualCode("");
    } catch {
      showToast("Invalid or already used code", "error");
    }
  }

  return (
    <div className="page-transition">
      <div className="flex flex-col items-center text-center mt-2">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-900/30 rotate-3 border-4 border-[#0f172a]">
          <Gift className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Invite & Earn
        </h2>
        <p className="text-slate-400 text-sm px-6 mb-6">
          Earn{" "}
          <span className="text-yellow-400 font-bold">
            {settings.referBonus}
          </span>{" "}
          coins per friend!
        </p>

        <div className="bg-slate-800/50 rounded-xl p-3 mb-6 border border-slate-700 w-full max-w-[200px]">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            Total Referrals
          </p>
          <p className="text-2xl font-bold text-white">
            {userData?.totalRefers || 0}
          </p>
        </div>

        <div className="w-full glass-card p-5 rounded-xl border border-dashed border-slate-600 mb-6 relative overflow-hidden">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
            Your Invite Code
          </p>
          <div className="flex items-center justify-center gap-4 bg-black/20 p-2 rounded-lg">
            <span className="text-2xl font-mono font-bold text-white tracking-widest select-all">
              {userData?.referralCode || "..."}
            </span>
            <button
              onClick={copyRefCode}
              className="w-8 h-8 bg-slate-700 hover:bg-white hover:text-black text-white rounded-full flex items-center justify-center transition"
              aria-label="Copy referral code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={shareOnTelegram}
          className="w-full bg-[#229ED9] hover:bg-[#1e8bc3] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg mb-6 active:scale-95 transition"
        >
          <Send className="w-4 h-4" /> Share on Telegram
        </button>

        {/* Manual Code Input */}
        <div className="w-full glass-card p-4 rounded-xl text-left">
          <p className="text-xs text-slate-400 mb-2 font-bold uppercase">
            Enter Referral Code Manually
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="CODE"
              className="bg-[#0f172a] flex-1 rounded-lg p-3 text-sm text-white border border-slate-700 outline-none uppercase font-mono focus:border-indigo-500 transition"
            />
            <button
              onClick={redeemManualReferral}
              className="bg-green-600 text-white px-5 rounded-lg font-bold text-sm active:scale-95 transition shadow-lg shadow-green-900/20"
            >
              APPLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
