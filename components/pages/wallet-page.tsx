"use client";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { db, APP_ID } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  runTransaction,
  doc,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { Landmark, Coins } from "lucide-react";

interface Withdrawal {
  id: string;
  method: string;
  details: string;
  amount: number;
  status: string;
  refundProcessed?: boolean;
  timestamp?: { seconds: number };
}

export default function WalletPage() {
  const { user, userData, settings } = useAuth();
  const { showToast } = useToast();
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const updatePlaceholder = useCallback(() => {
    const val = method.toLowerCase();
    if (val.includes("upi")) return "Enter UPI ID (e.g. name@okhdfcbank)";
    if (val.includes("bkash") || val.includes("nagad") || val.includes("rocket") || val.includes("number") || val.includes("gpay") || val.includes("phonepe") || val.includes("paytm"))
      return "Enter Mobile Number";
    if (val.includes("paypal") || val.includes("email"))
      return "Enter Email Address";
    if (val.includes("bank")) return "Enter Account No. & IFSC";
    return "Enter Payment Details";
  }, [method]);

  // Load withdrawal history
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `artifacts/${APP_ID}/public/data/withdrawals`),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs: Withdrawal[] = [];
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() } as Withdrawal));
      docs.sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      );

      // Process refunds for rejected withdrawals
      docs.forEach((d) => {
        if (d.status === "rejected" && !d.refundProcessed) {
          processRefund(d);
        }
      });

      setHistory(docs);
    });
    return () => unsub();
  }, [user]);

  async function processRefund(docData: Withdrawal) {
    if (!user) return;
    try {
      await runTransaction(db, async (t) => {
        const withdrawRef = doc(
          db,
          `artifacts/${APP_ID}/public/data/withdrawals`,
          docData.id
        );
        const userRef = doc(
          db,
          `artifacts/${APP_ID}/users/${user.uid}/profile`,
          "main"
        );

        const wDoc = await t.get(withdrawRef);
        if (!wDoc.exists() || wDoc.data()?.refundProcessed) return;

        const uDoc = await t.get(userRef);
        const currentBalance = uDoc.data()?.balance || 0;
        const refundAmount = Number(docData.amount);

        t.update(userRef, { balance: currentBalance + refundAmount });
        t.update(withdrawRef, { refundProcessed: true });
      });
      showToast(`Refund processed: +${docData.amount} Coins`, "success");
    } catch (e) {
      console.error("Refund error", e);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userData) return;

    if (!method) return showToast("Select Payment Method", "error");

    const a = parseInt(amount);
    const minW = settings.minWithdraw || 100;

    if (a > userData.balance) return showToast("Insufficient Coins!", "error");
    if (a < minW) return showToast(`Min withdraw ${minW} coins`, "error");
    if (!details.trim()) return showToast("Enter payment details", "error");

    try {
      const profileRef = doc(
        db,
        `artifacts/${APP_ID}/users/${user.uid}/profile`,
        "main"
      );
      await runTransaction(db, async (t) => {
        const d = await t.get(profileRef);
        t.update(profileRef, { balance: (d.data()?.balance || 0) - a });
      });

      await addDoc(
        collection(db, `artifacts/${APP_ID}/public/data/withdrawals`),
        {
          userId: user.uid,
          userName: userData.firstName,
          amount: Number(a),
          method,
          details: details.trim(),
          status: "pending",
          refundProcessed: false,
          timestamp: serverTimestamp(),
        }
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setMethod("");
      setDetails("");
      setAmount("");
    } catch (err) {
      showToast("Error submitting withdrawal", "error");
    }
  }

  return (
    <div className="page-transition">
      <h2 className="text-xl font-bold mb-4 px-1 text-white">Wallet</h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 text-center border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-xl" />
        <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest">
          Current Balance
        </p>
        <h1 className="text-5xl font-extrabold text-white mb-3 flex justify-center items-center gap-2 tracking-tight">
          {userData?.balance || 0}{" "}
          <Coins className="w-8 h-8 text-yellow-500" />
        </h1>
        <div className="inline-block bg-slate-800/80 backdrop-blur border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-300">
          Rate: 100 Coins ={" "}
          <span className="text-green-400 font-bold">
            {settings.coinValue}
          </span>
        </div>
      </div>

      {/* Withdraw Form */}
      <div className="glass-card rounded-2xl p-5 mb-8">
        <h3 className="font-bold text-sm text-indigo-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Landmark className="w-4 h-4" /> Withdraw Money
        </h3>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="relative">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3.5 text-sm text-white appearance-none outline-none focus:border-indigo-500 transition"
            >
              <option value="" disabled>
                Select Payment Method
              </option>
              {settings.paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-4 w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            placeholder={updatePlaceholder()}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder={`Amount (Min ${settings.minWithdraw} Coins)`}
            min={settings.minWithdraw}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/20 active:scale-95 transition"
          >
            Redeem Now
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <h3 className="font-bold text-md text-white mb-3 px-1">
        Withdrawal History
      </h3>
      <div className="space-y-2 pb-10">
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">
            No transactions yet.
          </div>
        ) : (
          history.slice(0, 20).map((d) => {
            const col =
              d.status === "paid"
                ? "text-green-400"
                : d.status === "rejected"
                ? "text-red-400"
                : "text-yellow-400";
            return (
              <div
                key={d.id}
                className="glass-card p-3 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-sm text-white">{d.method}</p>
                  <p className="text-[10px] text-slate-400">{d.details}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">-{d.amount}</p>
                  <p className={`text-[10px] ${col} uppercase font-bold`}>
                    {d.status}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
          <div className="bg-slate-800 p-8 rounded-3xl border border-green-500/30 shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5" />
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Success!
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Payment request submitted successfully.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 w-full mb-6">
              <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-widest">
                Estimated Arrival
              </p>
              <p className="text-yellow-400 font-bold text-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                24 - 48 Hours
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
                           }
