import React from 'react';
import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../../constants';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useReveal } from '../../hooks/useReveal';

export const TestimonialsFeature: React.FC = () => {
  const containerRef = useReveal<HTMLDivElement>({ duration: 1, stagger: 0.12 });

  return (
    <SectionWrapper
      id="testimonials"
      badge="Client Feedback"
      title="Trusted by Underwriters & Financial Leaders"
      subtitle="Discover how institutional risk teams transform policy analysis with the AI Advisory Agent."
    >
      <Container>
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <Card key={t.id} className="h-full flex flex-col justify-between p-8 border border-white/10">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-sky-400/40 mb-4" />
                <p className="text-sm text-slate-300 italic font-normal leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-sm font-bold text-white">{t.author}</div>
                <div className="text-xs text-sky-400 font-medium">{t.role}</div>
                <div className="text-xs text-slate-500">{t.company}</div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
};
