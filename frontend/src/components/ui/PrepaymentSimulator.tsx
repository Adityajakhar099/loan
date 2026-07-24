import React, { useState, useMemo } from 'react';
import { DollarSign, Clock, ShieldCheck, Zap } from 'lucide-react';

interface PrepaymentSimulatorProps {
  amount: number;
  rate: number;
  tenureYears: number;
}

export const PrepaymentSimulator: React.FC<PrepaymentSimulatorProps> = ({
  amount,
  rate,
  tenureYears,
}) => {
  const [extraMonthly, setExtraMonthly] = useState<number>(250);
  const [lumpSum, setLumpSum] = useState<number>(10000);

  const simulation = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const totalMonths = tenureYears * 12;
    const standardEmi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    // Standard baseline without prepayment
    let stdBalance = amount;
    let stdTotalInterest = 0;
    for (let m = 1; m <= totalMonths; m++) {
      const interest = stdBalance * monthlyRate;
      const principal = standardEmi - interest;
      stdTotalInterest += interest;
      stdBalance = Math.max(0, stdBalance - principal);
    }

    // Prepayment simulation (Lump sum applied in Month 1)
    let simBalance = Math.max(0, amount - lumpSum);
    let simTotalInterest = 0;
    let simMonthsCount = 0;

    while (simBalance > 0 && simMonthsCount < totalMonths) {
      simMonthsCount++;
      const interest = simBalance * monthlyRate;
      const regularPrincipal = standardEmi - interest;
      const totalPrincipalPaid = regularPrincipal + extraMonthly;
      simTotalInterest += interest;
      simBalance = Math.max(0, simBalance - totalPrincipalPaid);
    }

    const interestSaved = Math.max(0, Math.round(stdTotalInterest - simTotalInterest));
    const monthsSaved = Math.max(0, totalMonths - simMonthsCount);
    const yearsSaved = Math.round((monthsSaved / 12) * 10) / 10;

    return {
      standardEmi: Math.round(standardEmi),
      standardInterest: Math.round(stdTotalInterest),
      simulatedInterest: Math.round(simTotalInterest),
      interestSaved,
      monthsSaved,
      yearsSaved,
      newTermMonths: simMonthsCount,
    };
  }, [amount, rate, tenureYears, extraMonthly, lumpSum]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Extra Monthly Payment Slider */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Extra Monthly Payment</span>
            <span className="text-sky-400 font-mono font-bold">+${extraMonthly.toLocaleString()}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            step={50}
            value={extraMonthly}
            onChange={(e) => setExtraMonthly(Number(e.target.value))}
            className="w-full accent-sky-400 bg-slate-900 cursor-pointer h-2 rounded-lg"
          />
        </div>

        {/* Lump Sum Prepayment Slider */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">One-Time Lump Sum (Month 1)</span>
            <span className="text-sky-400 font-mono font-bold">${lumpSum.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={2500}
            value={lumpSum}
            onChange={(e) => setLumpSum(Number(e.target.value))}
            className="w-full accent-sky-400 bg-slate-900 cursor-pointer h-2 rounded-lg"
          />
        </div>
      </div>

      {/* Impact Output Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Interest Saved</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ${simulation.interestSaved.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Reduced Interest Liability
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-sky-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Loan Term Reduction</span>
            <div className="text-2xl font-black text-sky-400 font-mono mt-1">
              {simulation.yearsSaved} Years Faster
            </div>
            <span className="text-[11px] text-sky-400/90 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Payoff in {simulation.newTermMonths} Months
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
