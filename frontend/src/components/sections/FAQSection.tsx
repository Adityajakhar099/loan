import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../constants';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { fadeInUp, staggerContainer } from '../../animations/framer';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SectionWrapper
      id="faq"
      badge="Frequently Asked Questions"
      title="Everything You Need to Know"
      subtitle="Clear details on policy document indexing, system security, and AI response accuracy."
    >
      <Container size="small">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div key={faq.id} variants={fadeInUp}>
                <Card
                  hoverEffect={false}
                  className={`cursor-pointer transition-all duration-200 ${
                    isOpen ? 'border-sky-500/40 bg-slate-900/80 shadow-glow' : 'hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between gap-4 text-left focus:outline-none"
                  >
                    <span className="text-base font-semibold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-sky-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-sm text-slate-300 font-normal leading-relaxed border-t border-slate-800/80 mt-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
};
