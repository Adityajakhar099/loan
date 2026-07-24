import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Container';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav shadow-2xl py-3 border-b border-white/10' : 'bg-transparent py-5'
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-none">
                Loan<span className="text-sky-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                SaaS Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 glass-card border border-white/10">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="glass" size="sm">
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                const el = document.getElementById('pricing');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white glass-card border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 rounded-2xl glass-card border border-white/10 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-200 hover:text-sky-400 text-base font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <hr className="border-slate-800 my-1" />
            <div className="flex flex-col gap-2.5 pt-2">
              <Button variant="glass" size="md" className="w-full justify-center">
                Sign In
              </Button>
              <Button variant="primary" size="md" className="w-full justify-center">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
