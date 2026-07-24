import React from 'react';
import { motion } from 'framer-motion';
import { STATS } from '../../constants';
import { Container } from '../ui/Container';
import { fadeInUp, staggerContainer } from '../../animations/framer';

export const StatisticsSection: React.FC = () => {
  return (
    <section className="py-20 relative bg-slate-950/60 border-y border-slate-800/80">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.id}
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl glass-card border border-white/5"
            >
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-white mb-1">{stat.label}</div>
              <div className="text-xs text-slate-400 font-normal">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
