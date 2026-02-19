"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface MathGameProps {
  onClose: () => void;
  onWin: () => void;
}

export default function MathGame({ onClose, onWin }: MathGameProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  const generateQuestion = useCallback(() => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    const ans = n1 + n2;
    setQuestion(`${n1} + ${n2} = ?`);
    setAnswer(ans);

    const opts = [
      ans,
      ans + Math.floor(Math.random() * 5) + 1,
      ans - Math.floor(Math.random() * 5) - 1,
      ans + 10,
    ];
    opts.sort(() => Math.random() - 0.5);
    setOptions(opts);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  function checkAnswer(ans: number) {
    if (ans === answer) {
      onWin();
    } else {
      generateQuestion();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Math Solve</h2>
          <button
            onClick={onClose}
            className="text-white bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Close game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center mb-6">
          <p className="text-4xl font-bold text-white mb-2">{question}</p>
          <p className="text-slate-400 text-xs">Select correct answer</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => checkAnswer(opt)}
              className="bg-slate-700 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-xl transition active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
