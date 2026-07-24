import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../constants';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useReveal } from '../../hooks/useReveal';

export const FAQFeature: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const containerRef = useReveal<HTMLDivElement>({ duration: 1 });

  return (
    <SectionWrapper
      id="faq"
      badge="Frequently Asked Questions"
      title="Everything You Need to Know"
      subtitle="Comprehensive answers on policy indexing, vector security, and institutional deployment."
    >
      <Container size="small">
        <div ref={containerRef} className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <Card
                key={faq.id}
                hoverEffect={false}
                className={`cursor-pointer transition-all duration-200 ${
                  isOpen ? 'border-sky-500/40 bg-slate-900/80 shadow-glow' : 'hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 text-left focus:outline-none"
                >
                  <span className="text-base font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-sky-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="pt-4 text-sm text-slate-300 font-normal leading-relaxed border-t border-slate-800/80 mt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </SectionWrapper>
  );
};
