"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";

const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

interface TicTacToeGameProps {
  onClose: () => void;
  onWin: () => void;
  onLose: () => void;
}

export default function TicTacToeGame({ onClose, onWin, onLose }: TicTacToeGameProps) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState("Your Turn (X)");

  const checkWin = useCallback((b: string[], player: string) => {
    return WINS.some((c) => c.every((i) => b[i] === player));
  }, []);

  const findWinningMove = useCallback((b: string[], player: string) => {
    for (const [x, y, z] of WINS) {
      if (b[x] === player && b[y] === player && b[z] === "") return z;
      if (b[x] === player && b[z] === player && b[y] === "") return y;
      if (b[y] === player && b[z] === player && b[x] === "") return x;
    }
    return -1;
  }, []);

  const compMove = useCallback(
    (b: string[]) => {
      let move = findWinningMove(b, "O");
      if (move === -1) move = findWinningMove(b, "X");
      if (move === -1 && b[4] === "") move = 4;
      if (move === -1) {
        const empty = b
          .map((v, i) => (v === "" ? i : null))
          .filter((v) => v !== null) as number[];
        move = empty[Math.floor(Math.random() * empty.length)];
      }
      return move;
    },
    [findWinningMove]
  );

  function userMove(idx: number) {
    if (!active || board[idx] !== "") return;

    const newBoard = [...board];
    newBoard[idx] = "X";
    setBoard(newBoard);

    if (checkWin(newBoard, "X")) {
      setActive(false);
      setStatus("You Won!");
      setTimeout(() => onWin(), 1000);
      return;
    }

    if (!newBoard.includes("")) {
      setStatus("Draw!");
      setTimeout(() => resetGame(), 1500);
      return;
    }

    setStatus("AI Thinking...");
    setTimeout(() => {
      const move = compMove(newBoard);
      if (move === -1 || move === undefined) return;
      newBoard[move] = "O";
      setBoard([...newBoard]);

      if (checkWin(newBoard, "O")) {
        setActive(false);
        setStatus("Computer Won!");
        setTimeout(() => {
          onLose();
          resetGame();
        }, 1500);
      } else {
        setStatus("Your Turn (X)");
      }
    }, 600);
  }

  function resetGame() {
    setBoard(Array(9).fill(""));
    setActive(true);
    setStatus("Your Turn (X)");
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Tic Tac Toe</h2>
          <button
            onClick={onClose}
            className="text-white bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Close game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center mb-4">
          <p className="text-slate-300 text-sm">
            Beat Smart AI ={" "}
            <span className="text-yellow-400 font-bold">Win Coins</span>
          </p>
        </div>

        <div className="ttt-grid">
          {board.map((val, idx) => (
            <div
              key={idx}
              onClick={() => userMove(idx)}
              className={`ttt-cell ${val === "X" ? "x" : val === "O" ? "o" : ""}`}
            >
              {val}
            </div>
          ))}
        </div>

        <p className="text-center mt-6 text-lg font-bold text-white">
          {status}
        </p>
      </div>
    </div>
  );
        }
