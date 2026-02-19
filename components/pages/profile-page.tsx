"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { db, APP_ID } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { TrendingUp } from "lucide-react";

interface Earning {
  amount: number;
  source: string;
  timestamp?: { seconds: number };
}

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `artifacts/${APP_ID}/users/${user.uid}/earnings`),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs: Earning[] = [];
      snap.forEach((d) => docs.push(d.data() as Earning));
      docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setEarnings(docs);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="page-transition">
      <h2 className="text-xl font-bold mb-6 px-1 text-white">My Profile</h2>
      
      <div className="glass-card rounded-2xl p-6 text-center mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 mb-3 shadow-lg">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.firstName || "G")}&background=random`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover bg-slate-900"
              crossOrigin="anonymous"
            />
          </div>
          <h3 className="text-xl font-bold text-white">{userData?.firstName || "User"}</h3>
          <p className="text-slate-400 text-xs">Member since 2024</p>
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">
              Total Lifetime Earnings
            </p>
            <p className="text-2xl font-bold text-green-400 flex justify-center items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {userData?.totalEarned || 0}
            </p>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-md text-white mb-3 px-1">Earning History</h3>
      <div className="space-y-2 pb-10">
        {earnings.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            No earnings yet.
          </div>
        ) : (
          earnings.slice(0, 10).map((e, i) => (
            <div
              key={i}
              className="glass-card p-3 rounded-xl flex justify-between items-center border-l-2 border-green-500"
            >
              <div>
                <p className="font-bold text-sm text-white">{e.source}</p>
                <p className="text-[10px] text-slate-400">Won</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400 text-sm">+{e.amount}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
      }
