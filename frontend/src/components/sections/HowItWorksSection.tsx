import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Database, BrainCircuit, CheckSquare } from 'lucide-react';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { fadeInUp, staggerContainer } from '../../animations/framer';

const steps = [
  {
    step: '01',
    title: 'Index Loan Documents',
    description: 'Underwriting manuals, credit policies, and rate guides are chunked and embedded into high-dimensional vector index storage.',
    icon: <FileUp className="w-6 h-6 text-sky-400" />,
  },
  {
    step: '02',
    title: 'Natural Query Ingestion',
    description: 'Users submit natural language questions regarding LTV limits, DTI caps, collateral rules, or document requirements.',
    icon: <BrainCircuit className="w-6 h-6 text-blue-400" />,
  },
  {
    step: '03',
    title: 'Contextual Vector Retrieval',
    description: 'Semantic search pinpoints exact relevant passages from policy manuals with mathematical relevance scoring.',
    icon: <Database className="w-6 h-6 text-indigo-400" />,
  },
  {
    step: '04',
    title: 'Source-Backed Output',
    description: 'The agent formulates a clear answer complete with hyperlinked document citations and explicit page references.',
    icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <SectionWrapper
      id="how-it-works"
      badge="Workflow"
      title="How the AI Advisory Agent Works"
      subtitle="A multi-stage pipeline ensuring strict alignment between loan queries and official bank guidelines."
    >
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((item) => (
            <motion.div key={item.step} variants={fadeInUp}>
              <Card className="h-full relative overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-800 group-hover:text-sky-500/30 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
};
