import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, FileCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { fadeInUp, staggerContainer } from '../../animations/framer';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden">
      {/* Background Gradients & Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-8 backdrop-blur-md shadow-glow">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Next-Gen Enterprise AI Loan Intelligence</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={fadeInUp}
            custom={0.1}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
          >
            Instant, Source-Backed <br className="hidden sm:inline" />
            <span className="text-gradient-primary">Loan Policy Answers</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            custom={0.2}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10"
          >
            Ask complex lending guidelines in plain language and receive precise, verified policy explanations grounded in real underwriting documents.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            custom={0.3}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
          >
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Explore Advisory Demo
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Policy Architecture
            </Button>
          </motion.div>

          {/* Feature Highlights Bar */}
          <motion.div
            variants={fadeInUp}
            custom={0.4}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8 border-t border-slate-800/80"
          >
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <FileCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Zero Hallucinations</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sub-Second Response</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bank-Grade Encryption</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Mock Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-16 max-w-4xl mx-auto rounded-2xl glass-card p-6 sm:p-8 border border-white/10 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-500">loan-ai-advisory-console v1.0.0</span>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-start gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <span className="text-sky-400 font-bold">User:</span>
              <span className="text-slate-200">What is the minimum LTV ratio required for a commercial mortgage under Section 4.2 guidelines?</span>
            </div>
            <div className="flex items-start gap-3 bg-blue-950/30 p-4 rounded-xl border border-blue-900/40">
              <span className="text-emerald-400 font-bold">AI Agent:</span>
              <div className="text-slate-300 space-y-2">
                <p>According to <strong>Underwriting Guideline Doc #402 (Section 4.2)</strong>, the maximum LTV for commercial real estate is 75% for owner-occupied properties and 70% for investor properties.</p>
                <div className="inline-flex items-center gap-2 text-xs text-sky-400 bg-sky-950/60 px-3 py-1 rounded-md border border-sky-800/50">
                  <span>Source Cited: Commercial_Credit_Policy_2026.pdf [Page 42]</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
