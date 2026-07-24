import React from 'react';
import { STATS } from '../../constants';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useCounter } from '../../hooks/useCounter';
import { useReveal } from '../../hooks/useReveal';

const StatCard: React.FC<{ value: number; prefix?: string; suffix?: string; label: string; description: string }> = ({
  value,
  prefix = '',
  suffix = '',
  label,
  description,
}) => {
  const { ref, count } = useCounter({ endValue: value, duration: 2.5, decimals: value % 1 !== 0 ? 1 : 0 });

  return (
    <Card className="text-center p-8 border border-white/5 hover:border-sky-500/30 transition-colors">
      <div ref={ref} className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 mb-2 font-mono">
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm font-bold text-white mb-1">{label}</div>
      <div className="text-xs text-slate-400 font-normal leading-relaxed">{description}</div>
    </Card>
  );
};

export const BenefitsFeature: React.FC = () => {
  const containerRef = useReveal<HTMLDivElement>({ duration: 1, stagger: 0.1 });

  return (
    <SectionWrapper
      id="benefits"
      badge="Institutional Impact"
      title="Proven Performance Metrics"
      subtitle="Quantifiable efficiency gains across credit evaluation and loan underwriting operations."
    >
      <Container>
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <StatCard
              key={stat.id}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
            />
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
};
