import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Container } from '../ui/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#01040d] border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Loan<span className="text-sky-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm font-normal leading-relaxed">
              Production-grade AI-powered Loan Advisory Agent delivering instant, policy-backed answers directly from verified financial lending guidelines.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/features" className="hover:text-sky-400 transition-colors">Features</Link></li>
              <li><a href="/#how-it-works" className="hover:text-sky-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">System Health</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact / Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Compliance</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Bank-Grade Encryption</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                SOC2 Type II & ISO 27001 Prepared Infrastructure.
              </p>
              <div className="flex items-center gap-2 pt-2 text-slate-400">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>support@loan-ai.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Loan Advisory Agent. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security Overview</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
