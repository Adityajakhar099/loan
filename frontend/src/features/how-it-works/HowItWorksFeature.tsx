import React from 'react';
import { FileUp, Database, BrainCircuit, CheckSquare } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { useReveal } from '../../hooks/useReveal';

const steps = [
  {
    step: '01',
    title: 'Index Policy Manuals',
    description: 'Underwriting guides, credit manuals, and rate tables are chunked and embedded into high-dimensional vector storage.',
    icon: <FileUp className="w-6 h-6 text-sky-400" />,
  },
  {
    step: '02',
    title: 'Natural Query Ingestion',
    description: 'Borrowers or underwriters ask natural language questions regarding LTV ratios, DTI caps, or required documents.',
    icon: <BrainCircuit className="w-6 h-6 text-blue-400" />,
  },
  {
    step: '03',
    title: 'Vector Context Retrieval',
    description: 'Semantic vector search pinpoints exact relevant passages from policy manuals with high mathematical confidence.',
    icon: <Database className="w-6 h-6 text-indigo-400" />,
  },
  {
    step: '04',
    title: 'Source-Attributed Output',
    description: 'The agent formulates a concise, compliant response complete with document citations, page numbers, and section references.',
    icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
  },
];

export const HowItWorksFeature: React.FC = () => {
  const containerRef = useReveal<HTMLDivElement>({ duration: 1, stagger: 0.15 });

  return (
    <SectionWrapper
      id="how-it-works"
      badge="System Architecture"
      title="How the AI Advisory Agent Works"
      subtitle="A multi-stage Retrieval-Augmented Generation pipeline ensuring strict alignment between queries and official policy guidelines."
    >
      <Container>
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <Card key={item.step} className="h-full relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-800 group-hover:text-sky-500/40 transition-colors font-mono">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
};
