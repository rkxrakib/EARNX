"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { auth, db, rtdb, APP_ID } from "./firebase";
import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  runTransaction,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  set,
  onDisconnect,
  onValue,
  serverTimestamp as rtdbTimestamp,
} from "firebase/database";

export interface UserData {
  uid: string;
  firstName: string;
  balance: number;
  referralCode: string;
  totalEarned: number;
  totalRefers: number;
  referredBy: string | null;
}

interface Settings {
  gameReward: number;
  referBonus: number;
  signupBonus: number;
  coinValue: string;
  paymentMethods: string[];
  tttReward: number;
  mathReward: number;
  minWithdraw: number;
  socials?: { telegram?: string; youtube?: string; instagram?: string };
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  settings: Settings;
  activeUsers: number;
  loading: boolean;
  saveGameEarnings: (amount: number, source: string) => Promise<void>;
  processReferral: (code: string) => Promise<void>;
  refreshUserData: () => void;
}

const defaultSettings: Settings = {
  gameReward: 10,
  referBonus: 500,
  signupBonus: 100,
  coinValue: "1 Taka",
  paymentMethods: ["bKash", "Nagad", "Rocket"],
  tttReward: 10,
  mathReward: 10,
  minWithdraw: 100,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  settings: defaultSettings,
  activeUsers: 0,
  loading: true,
  saveGameEarnings: async () => {},
  processReferral: async () => {},
  refreshUserData: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Setup presence system
  const setupPresence = useCallback((uid: string) => {
    const userStatusRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");
    const statusRef = ref(rtdb, "/status");

    onValue(connectedRef, (snap) => {
      if (snap.val() === false) return;
      onDisconnect(userStatusRef)
        .remove()
        .then(() => {
          set(userStatusRef, {
            state: "online",
            last_changed: rtdbTimestamp(),
          });
        });
    });

    onValue(statusRef, (snap) => {
  const val = snap.val();
  setActiveUsers(val ? Object.keys(val).length : 0);
});
  }, []);

  // Init user data
  const initUserData = useCallback(async (uid: string) => {
    const profileRef = doc(
      db,
      `artifacts/${APP_ID}/users/${uid}/profile`,
      "main"
    );

    try {
      const docSnap = await getDoc(profileRef);
      if (!docSnap.exists()) {
        const code = "FAST" + Math.floor(10000 + Math.random() * 90000);
        const initialData: UserData = {
          uid,
          firstName: "Guest",
          balance: 0,
          referralCode: code,
          totalEarned: 0,
          totalRefers: 0,
          referredBy: null,
        };
        await setDoc(profileRef, {
          ...initialData,
          joinedAt: serverTimestamp(),
        });

        // Register referral code
        try {
          await setDoc(
            doc(
              db,
              `artifacts/${APP_ID}/public/data/referralCodes`,
              code
            ),
            { userId: uid }
          );
        } catch (e) {
          console.error("Referral code registration failed", e);
        }

        setUserData(initialData);
      } else {
        setUserData(docSnap.data() as UserData);
      }

      // Listen for realtime updates
      onSnapshot(profileRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserData);
        }
      });
    } catch (e) {
      console.error("Init user data error", e);
      setUserData({
        uid,
        firstName: "Guest",
        balance: 0,
        referralCode: "ERR",
        totalEarned: 0,
        totalRefers: 0,
        referredBy: null,
      });
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setupPresence(firebaseUser.uid);
        await initUserData(firebaseUser.uid);
        setLoading(false);
      } else {
        // Auto sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Auth error", e);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [setupPresence, initUserData]);

  // Settings listener
  useEffect(() => {
    const settingsRef = doc(
      db,
      `artifacts/${APP_ID}/public/data/settings`,
      "global"
    );
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setSettings({
          gameReward: d.gameReward || 10,
          referBonus: d.referralBonus || 500,
          signupBonus: d.signupBonus || 100,
          coinValue: d.coinValue || "1 Taka",
          paymentMethods: d.paymentMethods || ["bKash", "Nagad", "Rocket"],
          tttReward: d.tttReward || 10,
          mathReward: d.mathReward || 10,
          minWithdraw: d.minWithdraw || 100,
          socials: d.socials || undefined,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const saveGameEarnings = useCallback(
    async (amount: number, source: string) => {
      if (!user) return;
      const profileRef = doc(
        db,
        `artifacts/${APP_ID}/users/${user.uid}/profile`,
        "main"
      );
      const earnRef = collection(
        db,
        `artifacts/${APP_ID}/users/${user.uid}/earnings`
      );

      try {
        await runTransaction(db, async (t) => {
          const d = await t.get(profileRef);
          const newBal = (d.data()?.balance || 0) + amount;
          const newTotal = (d.data()?.totalEarned || 0) + amount;
          t.update(profileRef, { balance: newBal, totalEarned: newTotal });
        });
        await addDoc(earnRef, {
          amount,
          source: source || "Game Win",
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.error("Save earnings error", e);
        throw e;
      }
    },
    [user]
  );

  const processReferral = useCallback(
    async (code: string) => {
      if (!user || !userData) return;
      code = code.trim().toUpperCase();
      if (userData.referredBy || code === userData.referralCode) return;

      try {
        const refCodeDoc = await getDoc(
          doc(
            db,
            `artifacts/${APP_ID}/public/data/referralCodes`,
            code
          )
        );
        if (!refCodeDoc.exists()) throw new Error("Invalid code");

        const userRef = doc(
          db,
          `artifacts/${APP_ID}/users/${user.uid}/profile`,
          "main"
        );
        await runTransaction(db, async (t) => {
          const d = await t.get(userRef);
          t.update(userRef, {
            balance: (d.data()?.balance || 0) + settings.signupBonus,
            totalEarned:
              (d.data()?.totalEarned || 0) + settings.signupBonus,
            referredBy: code,
          });
        });

        // Reward referrer
        const referrerId = refCodeDoc.data().userId;
        const referrerRef = doc(
          db,
          `artifacts/${APP_ID}/users/${referrerId}/profile`,
          "main"
        );
        try {
          await runTransaction(db, async (t) => {
            const d = await t.get(referrerRef);
            t.update(referrerRef, {
              balance: (d.data()?.balance || 0) + settings.referBonus,
              totalEarned:
                (d.data()?.totalEarned || 0) + settings.referBonus,
              totalRefers: (d.data()?.totalRefers || 0) + 1,
            });
          });
          await addDoc(
            collection(
              db,
              `artifacts/${APP_ID}/users/${referrerId}/earnings`
            ),
            {
              amount: settings.referBonus,
              source: `Referral: ${userData.firstName}`,
              timestamp: serverTimestamp(),
            }
          );
        } catch (err) {
          console.warn("Referrer update failed", err);
        }
      } catch (e) {
        console.error("Referral error", e);
        throw e;
      }
    },
    [user, userData, settings]
  );

  const refreshUserData = useCallback(() => {
    if (user) initUserData(user.uid);
  }, [user, initUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        settings,
        activeUsers,
        loading,
        saveGameEarnings,
        processReferral,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
