import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { fadeInUp, staggerContainer } from '../animations/framer';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Message Sent Successfully', 'Our enterprise team will reach out within 24 hours.', 'success');
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 1000);
  };

  return (
    <div className="pt-28 pb-20">
      <SectionWrapper
        badge="Get In Touch"
        title="Contact Our Enterprise Team"
        subtitle="Discuss custom lending policy integration, deployment options, or technical inquiries."
      >
        <Container>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Contact Info Cards */}
            <div className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400">Email Us</h4>
                      <p className="text-base font-bold text-white">enterprise@loan-ai.com</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400">Call Direct</h4>
                      <p className="text-base font-bold text-white">+1 (800) 555-LOAN-AI</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400">Headquarters</h4>
                      <p className="text-base font-bold text-white">Financial District, New York, NY</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Contact Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@bank.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                      Company / Financial Institution
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Apex Credit Union"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry or policy documentation requirements..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full justify-center"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Request
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </SectionWrapper>
    </div>
  );
};
