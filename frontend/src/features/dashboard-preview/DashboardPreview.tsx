import React, { useState } from 'react';
import { BarChart3, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useReveal } from '../../hooks/useReveal';

export const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'risk' | 'audit'>('metrics');
  const containerRef = useReveal<HTMLDivElement>({ duration: 1 });

  return (
    <SectionWrapper
      id="dashboard-preview"
      badge="Enterprise Dashboard"
      title="Realistic Institutional Underwriting Console"
      subtitle="Comprehensive risk monitoring, automated credit scoring, and compliance audit trail overview."
    >
      <Container>
        <div ref={containerRef} className="max-w-5xl mx-auto space-y-6">
          {/* Top Tab Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl glass-card border border-white/10 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'metrics' ? 'bg-sky-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Portfolio Metrics
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'risk' ? 'bg-sky-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk Heatmap
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'audit' ? 'bg-sky-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Trail
            </button>
          </div>

          {/* Tab Content Display */}
          <Card className="p-6 sm:p-8 border border-white/10 shadow-2xl">
            {activeTab === 'metrics' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">Total Active Applications</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">1,482</div>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% this month
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">Avg LTV Ratio</span>
                    <div className="text-2xl font-black text-sky-400 mt-1 font-mono">68.4%</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Optimal Underwriting Limit</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">Policy Compliance Score</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">99.8%</div>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Zero Policy Violations</span>
                  </div>
                </div>

                {/* SVG Visual Chart Representation */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-sky-400" /> Monthly Underwriting Volume ($ Millions)
                    </h4>
                    <span className="text-xs font-mono text-slate-500">2026 Q1-Q3</span>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-slate-800 px-2">
                    {[35, 42, 58, 65, 80, 92, 85, 110, 128].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-sm group-hover:brightness-125 transition-all shadow-glow"
                          style={{ height: `${(val / 130) * 100}%` }}
                        />
                        <span className="text-[10px] text-slate-500 font-mono">M{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Tier Risk Evaluation Matrix
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-white">Commercial Real Estate Portfolio</span>
                      <span className="text-xs text-slate-400 block">DSCR Avg 1.35x | Max LTV 72%</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LOW RISK
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-white">Unsecured Business Credit Lines</span>
                      <span className="text-xs text-slate-400 block">Min Credit Score 710 | Revenue Verification Required</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      MODERATE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3 animate-in fade-in duration-300 font-mono text-xs">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" /> Real-time Audit Trail Stream
                </h4>
                {[
                  { time: '10:48:12', user: 'officer_m_vance', action: 'Policy Check Query', doc: 'CRE_Policy_2026.pdf', result: 'Pass (99.8%)' },
                  { time: '10:45:04', user: 'system_agent', action: 'Vector Index Refresh', doc: 'Rate_Schedule_Q3.pdf', result: 'Indexed 42 chunks' },
                  { time: '10:41:20', user: 'officer_s_jenkins', action: 'DTI Exception Check', doc: 'Retail_Manual_v4.pdf', result: 'Approved' },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-sky-400">{row.time}</span>
                    <span className="text-slate-400">{row.user}</span>
                    <span className="text-white font-bold">{row.action}</span>
                    <span className="text-slate-500 truncate max-w-[150px]">{row.doc}</span>
                    <span className="text-emerald-400 font-semibold">{row.result}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Container>
    </SectionWrapper>
  );
};
