import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Container size="small">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-12 rounded-3xl glass-card border border-white/10 max-w-xl mx-auto shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <FileQuestion className="w-10 h-10" />
          </div>

          <h1 className="text-6xl font-black text-white mb-2">404</h1>
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Page Not Found</h2>
          <p className="text-sm text-slate-400 font-normal leading-relaxed mb-8">
            The policy route or page you are searching for does not exist or has been relocated within our loan advisory system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="md" leftIcon={<Home className="w-4 h-4" />}>
                Return to Home
              </Button>
            </Link>
            <button onClick={() => window.history.back()}>
              <Button size="md" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Go Back
              </Button>
            </button>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};
