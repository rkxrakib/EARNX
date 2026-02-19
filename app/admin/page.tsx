"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db, rtdb, APP_ID } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import {
  Home,
  List,
  Settings,
  Menu,
  Power,
  Users,
  Clock,
  Shield,
  ChevronDown,
} from "lucide-react";

// Types
interface AdminSettings {
  referralBonus?: number;
  signupBonus?: number;
  gameReward?: number;
  tttReward?: number;
  mathReward?: number;
  minWithdraw?: number;
  coinValue?: string;
  paymentMethods?: string[];
  socials?: { telegram?: string; youtube?: string; instagram?: string };
}

interface WithdrawalDoc {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  details: string;
  status: string;
}

// Toast Component
function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div className="fixed top-5 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
      <div
        className={`px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${
          type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

// Login Screen
function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => void; loginLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 p-6">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
        <Shield className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>
      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-xl font-bold w-full shadow-lg shadow-blue-900/20 active:scale-[0.98] transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

// Confirm Modal
function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 w-full max-w-sm text-center p-6 rounded-2xl border border-slate-600 relative">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-xs mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${confirmColor} text-white font-bold py-3 rounded-xl text-sm`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Settings state
  const [currentSettings, setCurrentSettings] = useState<AdminSettings>({});
  const [referBonus, setReferBonus] = useState("500");
  const [signupBonus, setSignupBonus] = useState("100");
  const [imageReward, setImageReward] = useState("10");
  const [tttReward, setTttReward] = useState("10");
  const [mathReward, setMathReward] = useState("10");
  const [minWithdraw, setMinWithdraw] = useState("100");
  const [coinValue, setCoinValue] = useState("1 Taka");

  // More tab state
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [telegram, setTelegram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [instagram, setInstagram] = useState("");

  // Stats
  const [liveUsers, setLiveUsers] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalDoc[]>([]);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    action: () => Promise<void>;
  } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  async function handleLogin(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Login successful", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      showToast(message, "error");
    }
  }

  // Load settings
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, `artifacts/${APP_ID}/public/data/settings/global`),
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data() as AdminSettings;
          setCurrentSettings(d);
          setReferBonus(String(d.referralBonus || 500));
          setSignupBonus(String(d.signupBonus || 100));
          setImageReward(String(d.gameReward || 10));
          setTttReward(String(d.tttReward || 10));
          setMathReward(String(d.mathReward || 10));
          setMinWithdraw(String(d.minWithdraw || 100));
          setCoinValue(d.coinValue || "1 Taka");
          if (d.socials) {
            setTelegram(d.socials.telegram || "");
            setYoutube(d.socials.youtube || "");
            setInstagram(d.socials.instagram || "");
          }
        }
      }
    );
    return () => unsub();
  }, [user]);

  // Live users
  useEffect(() => {
    if (!user) return;
    const unsub = onValue(ref(rtdb, "/status"), (snap) => {
  const val = snap.val();
  setLiveUsers(val ? Object.keys(val).length : 0);
});
    return () => unsub();
  }, [user]);

  // Withdrawals listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `artifacts/${APP_ID}/public/data/withdrawals`),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPendingCount(snap.size);
      const docs: WithdrawalDoc[] = [];
      snap.forEach((d) =>
        docs.push({ id: d.id, ...d.data() } as WithdrawalDoc)
      );
      setWithdrawals(docs);
    });
    return () => unsub();
  }, [user]);

  // Save settings
  async function saveSettings() {
    try {
      await setDoc(
        doc(db, `artifacts/${APP_ID}/public/data/settings/global`),
        {
          referralBonus: parseInt(referBonus),
          signupBonus: parseInt(signupBonus),
          gameReward: parseInt(imageReward),
          tttReward: parseInt(tttReward),
          mathReward: parseInt(mathReward),
          minWithdraw: parseInt(minWithdraw),
          coinValue,
        },
        { merge: true }
      );
      showToast("Settings Saved!", "success");
    } catch {
      showToast("Error saving", "error");
    }
  }

  // Save socials
  async function saveSocials() {
    try {
      await setDoc(
        doc(db, `artifacts/${APP_ID}/public/data/settings/global`),
        { socials: { telegram, youtube, instagram } },
        { merge: true }
      );
      showToast("Links Updated", "success");
    } catch {
      showToast("Error saving", "error");
    }
  }

  // Payment methods
  async function addPaymentMethod() {
    const val = newPaymentMethod.trim();
    if (!val) return;
    const current = currentSettings.paymentMethods || [];
    if (current.includes(val)) return;
    try {
      await setDoc(
        doc(db, `artifacts/${APP_ID}/public/data/settings/global`),
        { paymentMethods: [...current, val] },
        { merge: true }
      );
      showToast("Added", "success");
      setNewPaymentMethod("");
    } catch {
      showToast("Error", "error");
    }
  }

  async function removePaymentMethod(val: string) {
    const current = currentSettings.paymentMethods || [];
    const updated = current.filter((m) => m !== val);
    try {
      await updateDoc(
        doc(db, `artifacts/${APP_ID}/public/data/settings/global`),
        { paymentMethods: updated }
      );
      showToast("Removed", "success");
    } catch {
      showToast("Error", "error");
    }
  }

  // Withdrawal actions
  async function handleWithdrawalAction(id: string, status: string) {
    setConfirmModal({
      title: status === "paid" ? "Approve Payment?" : "Reject Request?",
      message:
        status === "paid" ? "Mark as PAID?" : "Refund coins to user?",
      confirmLabel: status === "paid" ? "Confirm" : "Reject",
      confirmColor: status === "paid" ? "bg-green-600" : "bg-red-600",
      action: async () => {
        try {
          await updateDoc(
            doc(
              db,
              `artifacts/${APP_ID}/public/data/withdrawals`,
              id
            ),
            { status }
          );
          showToast(
            status === "rejected"
              ? "Rejected & Refunded"
              : "Paid Successfully",
            "success"
          );
        } catch {
          showToast("Error", "error");
        }
        setConfirmModal(null);
      },
    });
  }

  if (!authReady) return null;
  if (!user) return <LoginScreen onLogin={handleLogin} loginLoading={false} />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-24" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          confirmColor={confirmModal.confirmColor}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome Admin</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="bg-slate-800 p-2 rounded-lg text-red-400 border border-slate-700"
            aria-label="Logout"
          >
            <Power className="w-4 h-4" />
          </button>
        </header>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="animate-[fadeIn_0.2s]">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <h2 className="text-2xl font-bold text-white">{liveUsers}</h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Active
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Clock className="w-6 h-6 text-green-400 mb-2" />
                <h2 className="text-2xl font-bold text-white">
                  {pendingCount}
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Pending
                </p>
              </div>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-sm mb-2 text-white">
                Quick Actions
              </h3>
              <p className="text-xs text-slate-400">
                Use the bottom menu to manage requests and settings.
              </p>
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="animate-[fadeIn_0.2s]">
            <h3 className="text-lg font-bold mb-4 text-white">
              Withdrawal Requests
            </h3>
            <div className="space-y-3 pb-4">
              {withdrawals.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-10">
                  No pending requests
                </p>
              ) : (
                withdrawals.map((d) => (
                  <div
                    key={d.id}
                    className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-white">
                          {d.userName}
                        </p>
                        <p className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block mt-1">
                          {d.method}
                        </p>
                      </div>
                      <p className="text-sm text-yellow-400 font-bold">
                        {d.amount}
                      </p>
                    </div>
                    <div className="bg-black/20 p-2 rounded text-[11px] font-mono text-slate-400 break-all border border-white/5">
                      {d.details}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleWithdrawalAction(d.id, "paid")
                        }
                        className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex-1 text-center active:scale-95 transition"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() =>
                          handleWithdrawalAction(d.id, "rejected")
                        }
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex-1 text-center active:scale-95 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="animate-[fadeIn_0.2s]">
            <h3 className="text-lg font-bold mb-4 text-white">
              Reward Settings
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Refer Bonus
                </label>
                <input
                  type="number"
                  value={referBonus}
                  onChange={(e) => setReferBonus(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
                />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Signup Bonus
                </label>
                <input
                  type="number"
                  value={signupBonus}
                  onChange={(e) => setSignupBonus(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 border-l-4 border-l-indigo-500">
                <h4 className="text-sm font-bold text-indigo-400 mb-3">
                  Games Rewards
                </h4>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Image Finder Reward
                </label>
                <input
                  type="number"
                  value={imageReward}
                  onChange={(e) => setImageReward(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm mb-3"
                />
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Tic Tac Toe Reward
                </label>
                <input
                  type="number"
                  value={tttReward}
                  onChange={(e) => setTttReward(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm mb-3"
                />
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Math Solve Reward
                </label>
                <input
                  type="number"
                  value={mathReward}
                  onChange={(e) => setMathReward(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Min Withdraw
                </label>
                <input
                  type="number"
                  value={minWithdraw}
                  onChange={(e) => setMinWithdraw(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
                />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Coin Value Text
                </label>
                <input
                  type="text"
                  value={coinValue}
                  onChange={(e) => setCoinValue(e.target.value)}
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full outline-none focus:border-blue-500 transition text-sm"
                />
              </div>
              <button
                onClick={saveSettings}
                className="bg-blue-600 text-white p-3 rounded-xl font-bold w-full mt-4 active:scale-[0.98] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* MORE TAB */}
        {activeTab === "more" && (
          <div className="animate-[fadeIn_0.2s]">
            <h3 className="text-lg font-bold mb-4 text-white">
              Configuration
            </h3>

            {/* Payment Methods */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-4">
              <h4 className="font-bold text-sm text-green-400 mb-3">
                Payment Methods
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  placeholder="Method Name"
                  className="bg-[#0f172a] border border-slate-600 text-white p-2 rounded-lg flex-1 text-xs outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={addPaymentMethod}
                  className="bg-blue-600 text-white px-4 rounded-lg text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentSettings.paymentMethods || []).map((m) => (
                  <div
                    key={m}
                    className="bg-slate-700 px-3 py-1 rounded text-xs flex items-center gap-2 border border-slate-600"
                  >
                    {m}
                    <button
                      onClick={() => removePaymentMethod(m)}
                      className="text-red-400 font-bold ml-1"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-sm text-blue-400 mb-3">
                Social Links
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="Telegram URL"
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full text-xs outline-none focus:border-blue-500 transition"
                />
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="YouTube URL"
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full text-xs outline-none focus:border-blue-500 transition"
                />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram URL"
                  className="bg-[#0f172a] border border-slate-600 text-white p-3 rounded-xl w-full text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <button
                onClick={saveSocials}
                className="bg-blue-600 text-white p-2 rounded-xl font-bold w-full mt-3 text-xs active:scale-[0.98] transition"
              >
                Update Links
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700 flex justify-around py-2.5 z-50 pb-[env(safe-area-inset-bottom,10px)]">
        {[
          { id: "home", label: "Home", icon: Home },
          { id: "requests", label: "Requests", icon: List, badge: pendingCount > 0 },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "more", label: "More", icon: Menu },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center border-none bg-transparent text-[10px] font-semibold transition-all ${
                isActive ? "text-blue-500" : "text-slate-400"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 ${isActive ? "translate-y-[-2px]" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
