import React, { useState, useMemo } from 'react';
import { Download, Table, Calendar } from 'lucide-react';
import { Button } from './Button';

interface AmortizationRow {
  period: number;
  label: string;
  startBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endBalance: number;
}

interface AmortizationScheduleTableProps {
  amount: number;
  rate: number;
  tenureYears: number;
}

export const AmortizationScheduleTable: React.FC<AmortizationScheduleTableProps> = ({
  amount,
  rate,
  tenureYears,
}) => {
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');

  const { monthlyRows, annualRows } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const totalMonths = tenureYears * 12;
    const emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const mRows: AmortizationRow[] = [];
    const aRows: AmortizationRow[] = [];

    let currentBalance = amount;
    let accumulatedInterest = 0;
    let accumulatedPrincipal = 0;

    let yearStartBalance = amount;
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const interestPaid = currentBalance * monthlyRate;
      const principalPaid = emi - interestPaid;
      const endBalance = Math.max(0, currentBalance - principalPaid);

      mRows.push({
        period: m,
        label: `Month ${m}`,
        startBalance: Math.round(currentBalance),
        payment: Math.round(emi),
        principal: Math.round(principalPaid),
        interest: Math.round(interestPaid),
        endBalance: Math.round(endBalance),
      });

      accumulatedInterest += interestPaid;
      accumulatedPrincipal += principalPaid;
      yearInterest += interestPaid;
      yearPrincipal += principalPaid;

      currentBalance = endBalance;

      if (m % 12 === 0 || m === totalMonths) {
        const yearNum = Math.ceil(m / 12);
        aRows.push({
          period: yearNum,
          label: `Year ${yearNum}`,
          startBalance: Math.round(yearStartBalance),
          payment: Math.round(yearPrincipal + yearInterest),
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          endBalance: Math.round(endBalance),
        });
        yearStartBalance = endBalance;
        yearInterest = 0;
        yearPrincipal = 0;
      }
    }

    return {
      monthlyRows: mRows,
      annualRows: aRows,
    };
  }, [amount, rate, tenureYears]);

  const activeRows = viewMode === 'annual' ? annualRows : monthlyRows;

  const handleExportCSV = () => {
    const headers = ['Period,Start Balance ($),Payment ($),Principal ($),Interest ($),Ending Balance ($)'];
    const rows = activeRows.map(
      (r) => `${r.label},${r.startBalance},${r.payment},${r.principal},${r.interest},${r.endBalance}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amortization_Schedule_${amount}_${rate}pct_${tenureYears}Y.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'annual'
                ? 'bg-sky-500 text-slate-950 shadow-glow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Annual Summary
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'monthly'
                ? 'bg-sky-500 text-slate-950 shadow-glow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Monthly Detail
          </button>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportCSV}
        >
          Export CSV Schedule
        </Button>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto max-h-[420px] rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 font-mono text-slate-400">
            <tr>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4">Start Balance</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Principal</th>
              <th className="py-3 px-4">Interest</th>
              <th className="py-3 px-4">End Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {activeRows.map((row) => (
              <tr key={row.period} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-sky-400">{row.label}</td>
                <td className="py-2.5 px-4 text-slate-300">${row.startBalance.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-white font-bold">${row.payment.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-emerald-400">${row.principal.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-amber-400">${row.interest.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-slate-400">${row.endBalance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
