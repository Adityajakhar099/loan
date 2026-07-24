import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export const CanvasLoader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            onComplete?.();
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isFinished) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020617] flex flex-col items-center justify-center p-4 transition-opacity duration-700">
      <div className="flex items-center gap-3 mb-8 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-glow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">
          Loan<span className="text-sky-400">AI</span> <span className="text-xs uppercase text-slate-400 block font-normal">SaaS Suite</span>
        </span>
      </div>

      <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-200 ease-out shadow-glow"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="font-mono text-sm text-sky-400 font-semibold tracking-wider">
        {Math.min(progress, 100)}% LOADED
      </div>
    </div>
  );
};
