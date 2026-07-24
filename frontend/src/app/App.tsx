import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CustomCursor } from '../components/common/CustomCursor';
import { NoiseOverlay } from '../components/common/NoiseOverlay';
import { CanvasLoader } from '../components/common/CanvasLoader';
import { AppRoutes } from '../routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  useSmoothScroll();

  return (
    <>
      {loading && <CanvasLoader onComplete={() => setLoading(false)} />}
      <CustomCursor />
      <NoiseOverlay />
      
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
