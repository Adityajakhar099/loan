import React, { useState, useMemo } from 'react';
import { Calculator, Table, Zap } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useReveal } from '../../hooks/useReveal';
import { AmortizationScheduleTable } from '../../components/ui/AmortizationScheduleTable';
import { PrepaymentSimulator } from '../../components/ui/PrepaymentSimulator';

export const EMIPreview: React.FC = () => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(15);
  const [activeTab, setActiveTab] = useState<'schedule' | 'simulator'>('schedule');

  const containerRef = useReveal<HTMLDivElement>({ duration: 1 });

  // EMI Calculation Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emiDetails = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = tenureYears * 12;
    const emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalRatio: Math.round((amount / totalPayment) * 100),
      interestRatio: Math.round((totalInterest / totalPayment) * 100),
    };
  }, [amount, rate, tenureYears]);

  return (
    <SectionWrapper
      id="emi-preview"
      badge="Financial Advisory Suite"
      title="Dynamic EMI & Repayment Simulator"
      subtitle="Interactive loan calculator designed for immediate underwriting evaluation, amortization schedules, and prepayment savings."
    >
      <Container>
        <div ref={containerRef} className="max-w-5xl mx-auto space-y-8">
          {/* Main Controls & Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders Input Controls */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-sky-400" /> Adjust Loan Parameters
              </h3>

              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-400">Loan Amount</span>
                  <span className="text-white font-mono font-bold">${amount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={25000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-900 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>$50K</span>
                  <span>$2.0M</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-400">Interest Rate (p.a.)</span>
                  <span className="text-sky-400 font-mono font-bold">{rate}%</span>
                </div>
                <input
                  type="range"
                  min={3.5}
                  max={18.0}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-900 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>3.5%</span>
                  <span>18.0%</span>
                </div>
              </div>

              {/* Loan Tenure Slider */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-400">Tenure (Years)</span>
                  <span className="text-white font-mono font-bold">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-900 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>
            </Card>

            {/* Results Summary Card */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 border-sky-500/30">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monthly Repayment (EMI)
              </h4>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 font-mono mb-8">
                ${emiDetails.monthlyEmi.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">/ mo</span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Principal Amount</span>
                  <span className="text-white font-mono font-bold">${amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total Interest Payable</span>
                  <span className="text-amber-400 font-mono font-bold">${emiDetails.totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Total Payable Amount</span>
                  <span className="text-sky-400 font-mono font-black">${emiDetails.totalPayment.toLocaleString()}</span>
                </div>
              </div>

              {/* Visual Ratio Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Principal ({emiDetails.principalRatio}%)</span>
                  <span>Interest ({emiDetails.interestRatio}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="bg-sky-400 h-full" style={{ width: `${emiDetails.principalRatio}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${emiDetails.interestRatio}%` }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Interactive Financial Tools Section */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between p-2 rounded-2xl glass-card border border-white/10 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'schedule' ? 'bg-sky-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Amortization Schedule
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'simulator' ? 'bg-sky-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Prepayment Simulator
              </button>
            </div>

            {activeTab === 'schedule' && (
              <div className="animate-in fade-in duration-300">
                <AmortizationScheduleTable
                  amount={amount}
                  rate={rate}
                  tenureYears={tenureYears}
                />
              </div>
            )}

            {activeTab === 'simulator' && (
              <div className="animate-in fade-in duration-300">
                <PrepaymentSimulator
                  amount={amount}
                  rate={rate}
                  tenureYears={tenureYears}
                />
              </div>
            )}
          </Card>
        </div>
      </Container>
    </SectionWrapper>
  );
};

