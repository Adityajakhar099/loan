import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PricingPlan } from '../../types';
import { useReveal } from '../../hooks/useReveal';

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Advisory',
    priceMonthly: 299,
    priceAnnual: 249,
    description: 'Ideal for independent loan brokers & small credit unions indexing up to 50 policy documents.',
    features: [
      'Up to 50 Policy Documents Indexed',
      '5,000 AI Queries / month',
      'Standard Document Citation Engine',
      'Sub-1.2s Query Latency',
      'Email & Slack Support',
    ],
    ctaText: 'Start 14-Day Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Institutional Pro',
    badge: 'Most Popular',
    isPopular: true,
    priceMonthly: 899,
    priceAnnual: 749,
    description: 'Designed for regional banks & retail credit officers needing high-volume RAG index pipelines.',
    features: [
      'Up to 500 Policy Documents Indexed',
      'Unlimited AI Advisory Queries',
      'Instant Page & Section Citation Drawer',
      'Sub-800ms Vector Retrieval Latency',
      'Multi-Tier Underwriting Risk Heatmaps',
      'Dedicated Account Manager & 24/7 SLA',
    ],
    ctaText: 'Deploy Institutional Pro',
  },
  {
    id: 'custom',
    name: 'Custom Enterprise',
    priceMonthly: 2499,
    priceAnnual: 1999,
    description: 'Dedicated private cloud deployment for tier-1 global banking institutions.',
    features: [
      'Unlimited Policy Manual Indexing',
      'On-Premise or Private VPC Deployment',
      'Custom LLM Fine-Tuning & Safeguards',
      'SOC2 Type II & ISO 27001 Compliance Audit',
      'Full API Access & Custom Connectors',
    ],
    ctaText: 'Contact Enterprise Sales',
  },
];

export const PricingFeature: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const containerRef = useReveal<HTMLDivElement>({ duration: 1, stagger: 0.1 });

  return (
    <SectionWrapper
      id="pricing"
      badge="Flexible SaaS Pricing"
      title="Transparent Institutional Plans"
      subtitle="Scalable tier options for independent loan officers up to global banking institutions."
    >
      <Container>
        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-semibold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-slate-900 rounded-full p-1 border border-slate-800 relative transition-colors focus:outline-none"
          >
            <div
              className={`w-6 h-6 rounded-full bg-sky-400 transition-transform duration-300 ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Annual Billing
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              glow={plan.isPopular}
              className={`flex flex-col justify-between p-8 relative ${
                plan.isPopular ? 'border-sky-400/40 bg-slate-900/90 shadow-2xl scale-105 z-10' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-glow">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 font-normal mb-6 min-h-[36px]">{plan.description}</p>

                <div className="mb-6 font-mono">
                  <span className="text-4xl font-black text-white">
                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-xs text-slate-400 font-sans"> / month</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800/80 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant={plan.isPopular ? 'primary' : 'glass'}
                size="md"
                className="w-full justify-center"
              >
                {plan.ctaText}
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
};
