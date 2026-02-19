"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import LoadingScreen from "./loading-screen";
import AppHeader from "./app-header";
import BottomNav from "./bottom-nav";
import HomePage from "./pages/home-page";
import ProfilePage from "./pages/profile-page";
import WalletPage from "./pages/wallet-page";
import ReferPage from "./pages/refer-page";
import ImageFinderGame from "./games/image-finder-game";
import TicTacToeGame from "./games/tic-tac-toe-game";
import MathGame from "./games/math-game";
import ClaimOverlay from "./claim-overlay";

type GameType = "image-finder" | "tic-tac-toe" | "math" | null;

export default function MainApp() {
  const { loading, settings, saveGameEarnings } = useAuth();
  const { showToast } = useToast();
  const [activePage, setActivePage] = useState("home");
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [showClaim, setShowClaim] = useState(false);
  const pendingReward = useRef({ amount: 0, source: "" });
  const gamesPlayed = useRef(0);

  const processGameWin = useCallback(
    (source: string) => {
      let amount = settings.gameReward;
      if (source.includes("Tic Tac Toe") && settings.tttReward)
        amount = settings.tttReward;
      if (source.includes("Math") && settings.mathReward)
        amount = settings.mathReward;

      gamesPlayed.current++;
      pendingReward.current = { amount, source };

      setActiveGame(null);
      setShowClaim(true);
    },
    [settings]
  );

  const handleClaim = useCallback(async () => {
    setShowClaim(false);
    const { amount, source } = pendingReward.current;
    try {
      await saveGameEarnings(amount, source);
      showToast(`+${amount} Coins Added!`, "success");
    } catch {
      showToast("Network Error", "error");
    }
  }, [saveGameEarnings, showToast]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <AppHeader />

      <main className="flex-1 overflow-y-auto custom-scroll p-4 pb-28 relative">
        {activePage === "home" && (
          <HomePage
            onStartImageFinder={() => setActiveGame("image-finder")}
            onStartTicTacToe={() => setActiveGame("tic-tac-toe")}
            onStartMath={() => setActiveGame("math")}
          />
        )}
        {activePage === "profile" && <ProfilePage />}
        {activePage === "wallet" && <WalletPage />}
        {activePage === "refer" && <ReferPage />}
      </main>

      <BottomNav
        activePage={activePage}
        onNavigate={setActivePage}
        onPlayGame={() => setActiveGame("image-finder")}
      />

      {/* Game Modals */}
      {activeGame === "image-finder" && (
        <ImageFinderGame
          onClose={() => setActiveGame(null)}
          onWin={() => processGameWin("Image Finder Master")}
        />
      )}
      {activeGame === "tic-tac-toe" && (
        <TicTacToeGame
          onClose={() => setActiveGame(null)}
          onWin={() => processGameWin("Tic Tac Toe Champion")}
          onLose={() => {
            showToast("You Lost! Try Again.", "error");
            setActiveGame(null);
          }}
        />
      )}
      {activeGame === "math" && (
        <MathGame
          onClose={() => setActiveGame(null)}
          onWin={() => processGameWin("Math Genius")}
        />
      )}

      {/* Claim Overlay */}
      {showClaim && <ClaimOverlay onClaim={handleClaim} />}
    </div>
  );
          }
