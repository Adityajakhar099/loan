import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Cpu, Users } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { Card } from '../components/ui/Card';
import { fadeInUp, staggerContainer } from '../animations/framer';

export const About: React.FC = () => {
  return (
    <div className="pt-28 pb-20">
      <SectionWrapper
        badge="About Us"
        title="Revolutionizing Financial Advisory Through AI"
        subtitle="Empowering loan officers and underwriting teams with zero-hallucination policy retrieval."
      >
        <Container>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full p-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Core Mission</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Financial institutions manage thousands of pages of complex lending guidelines across multiple credit tiers and jurisdictions. Our mission is to transform static documentation into an instant, conversational intelligence system with absolute source attribution.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full p-8">
                <div className="w-12 h-12 rounded-xl bg-sky-600/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Clean Architecture</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Built on modern software engineering standards—FastAPI microservices, high-performance PostgreSQL vector storage, and responsive React frontend components—ensuring sub-second latency and bank-grade reliability.
                </p>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">100% Policy Grounded</h4>
                <p className="text-xs text-slate-400">Strict RAG boundaries eliminate risky AI guessing in credit evaluation.</p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-sky-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Built for Teams</h4>
                <p className="text-xs text-slate-400">Designed for credit officers, underwriting leads, and risk analysts.</p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center">
                <Cpu className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Modular AI Foundation</h4>
                <p className="text-xs text-slate-400">Ready to integrate Gemini, LangChain, FAISS, and OCR document parsers.</p>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </SectionWrapper>
    </div>
  );
};
