"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-pulse" />
        <div className="absolute inset-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-float">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-2">
        EarnFast
      </h1>
      <p className="text-slate-400 mb-8 text-sm">Loading your profile...</p>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500">Connecting...</p>
      </div>
    </div>
  );
}
