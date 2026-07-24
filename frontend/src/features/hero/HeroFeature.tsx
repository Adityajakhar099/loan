import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, FileCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Container';
import { Badge } from '../../components/ui/Badge';
import { AuroraScene } from '../../three/AuroraScene';
import { ParticleField } from '../../three/ParticleField';
import { useReveal } from '../../hooks/useReveal';
import { useFloating } from '../../hooks/useFloating';
import { useMagnetic } from '../../hooks/useMagnetic';

export const HeroFeature: React.FC = () => {
  const containerRef = useReveal<HTMLDivElement>({ duration: 1.2, stagger: 0.15 });
  const floatingBadgeRef = useFloating<HTMLDivElement>({ distance: 12, duration: 4 });
  const ctaMagneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.4 });

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden min-h-screen flex items-center justify-center">
      {/* 3D Background Scenes */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <AuroraScene />
        <ParticleField />
      </div>

      <Container>
        <div ref={containerRef} className="text-center max-w-4xl mx-auto flex flex-col items-center relative z-10">
          {/* Floating Badge */}
          <div ref={floatingBadgeRef} className="mb-8">
            <Badge icon={<Sparkles className="w-4 h-4 text-sky-400" />}>
              Enterprise AI Loan Intelligence Platform
            </Badge>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Instant, Source-Backed <br className="hidden sm:inline" />
            <span className="text-gradient-primary">Loan Policy Answers</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
            Query complex institutional lending guidelines in natural language and receive verified underwriting answers grounded in real policy manuals with zero hallucination.
          </p>

          {/* Magnetic CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Button
              ref={ctaMagneticRef}
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => {
                const el = document.getElementById('ai-preview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Launch Live Advisory Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                const el = document.getElementById('dashboard-preview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Underwriting Dashboard
            </Button>
          </div>

          {/* Metrics & Assurance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <FileCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Zero Hallucination RAG</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sub-800ms Retrieval</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SOC2 & Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
