import React, { useState } from 'react';
import { Send, FileText, Sparkles, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChatMessage } from '../../types';
import { useReveal } from '../../hooks/useReveal';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'user',
    text: 'What is the maximum LTV ratio allowed for a commercial real estate loan under Section 4.2 guidelines?',
    timestamp: '10:42 AM',
  },
  {
    id: '2',
    sender: 'agent',
    text: 'According to Commercial Credit Policy Guideline #402 (Section 4.2, Page 42), the maximum Loan-to-Value (LTV) ratio for commercial real estate is 75% for owner-occupied properties and 70% for investor-owned commercial assets. A minimum Debt Service Coverage Ratio (DSCR) of 1.25x is also required.',
    timestamp: '10:42 AM',
    sources: [
      {
        documentName: 'Commercial_Credit_Policy_2026.pdf',
        section: 'Section 4.2 - CRE LTV Limits',
        page: 42,
        confidence: 99.8,
      },
      {
        documentName: 'Underwriting_Risk_Framework.pdf',
        section: 'Section 1.8 - DSCR Requirements',
        page: 14,
        confidence: 97.4,
      },
    ],
  },
];

const PRESET_PROMPTS = [
  'What are the minimum income requirements for a Home Equity Line of Credit?',
  'What is the maximum debt-to-income (DTI) ratio permitted for Tier-1 borrowers?',
  'What secondary collateral is acceptable for commercial equipment financing?',
];

export const AIChatPreview: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{ documentName: string; section: string; page: number } | null>(null);

  const containerRef = useReveal<HTMLDivElement>({ duration: 1 });

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `Based on Retail Underwriting Policy Manual (Doc #109, Section 3.1), the maximum Debt-to-Income (DTI) ratio for Tier-1 borrowers is 45%. For borrowers with credit scores above 760 and 6+ months liquid reserves, an exception threshold up to 50% may be authorized by a Senior Risk Officer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          {
            documentName: 'Retail_Underwriting_Manual_v4.pdf',
            section: 'Section 3.1 - DTI Caps & Exception Thresholds',
            page: 18,
            confidence: 99.2,
          },
        ],
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <SectionWrapper
      id="ai-preview"
      badge="Live AI Console"
      title="Source-Backed Policy Chatbot Interface"
      subtitle="Experience real-time policy retrieval with exact document citations, section references, and zero hallucination risk."
    >
      <Container>
        <div ref={containerRef} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col h-[620px] border border-white/10 shadow-2xl relative">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Loan AI Policy Agent
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Indexing 500+ Guideline Manuals</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setMessages(INITIAL_MESSAGES)}
              >
                Reset
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-950/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-tr-none shadow-glow-primary'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="font-sans mb-1">{msg.text}</div>
                    
                    {/* Sources Badge List */}
                    {msg.sources && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Cited Policy Sources:
                        </span>
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedSource(src)}
                            className="flex items-center justify-between text-xs bg-slate-950/80 hover:bg-slate-800 p-2.5 rounded-lg border border-slate-800/80 cursor-pointer transition-colors group"
                          >
                            <span className="text-slate-300 font-mono truncate group-hover:text-sky-400">
                              {src.documentName} [{src.section}]
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 ml-2">
                              {src.confidence}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block text-right mt-1.5 font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs text-sky-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    Synthesizing response from policy vectors...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask any policy, rate limit, or underwriting question..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <Button size="md" onClick={() => handleSend()} rightIcon={<Send className="w-4 h-4" />}>
                  Ask AI
                </Button>
              </div>
            </div>
          </Card>

          {/* Sidebar & Preset Prompts */}
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" /> Preset Sample Queries
              </h4>
              <div className="space-y-3">
                {PRESET_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 p-3 rounded-xl border border-slate-800/80 transition-all leading-relaxed"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-sky-500/20 bg-sky-950/10">
              <div className="flex items-center gap-3 text-sky-400 font-bold text-sm mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Policy Guardrail System
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our strict RAG architecture enforces continuous document vector grounding. If a query falls outside official guidelines, the agent explicitly refrains from generating assumptions.
              </p>
            </Card>
          </div>
        </div>

        {/* Source Citation Modal Drawer */}
        {selectedSource && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
              <button
                onClick={() => setSelectedSource(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-4">
                <FileText className="w-5 h-5" /> Verified Policy Document
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{selectedSource.documentName}</h4>
              <p className="text-xs text-sky-300 font-mono mb-4">{selectedSource.section} (Page {selectedSource.page})</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed mb-6">
                "...The maximum allowable LTV for commercial real estate collateral shall not exceed 75.0% for owner-occupied assets. Any deviation requires approval from the Executive Risk Committee."
              </div>
              <Button size="sm" className="w-full justify-center" onClick={() => setSelectedSource(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Container>
    </SectionWrapper>
  );
};
