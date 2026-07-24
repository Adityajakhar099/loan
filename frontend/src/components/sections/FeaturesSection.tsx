import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle2, Calculator, ScanText, ShieldCheck } from 'lucide-react';
import { FEATURES } from '../../constants';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { fadeInUp, staggerContainer } from '../../animations/framer';

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-6 h-6 text-sky-400" />,
  Search: <Search className="w-6 h-6 text-blue-400" />,
  CheckCircle2: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
  Calculator: <Calculator className="w-6 h-6 text-amber-400" />,
  ScanText: <ScanText className="w-6 h-6 text-indigo-400" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-teal-400" />,
};

export const FeaturesSection: React.FC = () => {
  return (
    <SectionWrapper
      id="features"
      badge="Core Capabilities"
      title="Engineered for Financial Precision"
      subtitle="High-performance architecture built from the ground up to solve complex loan policy challenges."
    >
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.id} variants={fadeInUp}>
              <Card className="h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-sky-500/50 group-hover:scale-110 transition-all duration-300">
                      {iconMap[feature.iconName]}
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-normal leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
};
