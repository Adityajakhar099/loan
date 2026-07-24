import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../constants';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { fadeInUp, staggerContainer } from '../../animations/framer';

export const TestimonialsSection: React.FC = () => {
  return (
    <SectionWrapper
      id="testimonials"
      badge="Client Feedback"
      title="Trusted by Underwriters & Financial Leaders"
      subtitle="Here is how our AI Loan Advisory Agent transforms credit analysis and policy guidance."
    >
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.id} variants={fadeInUp}>
              <Card className="h-full flex flex-col justify-between p-8">
                <div>
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
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
};
