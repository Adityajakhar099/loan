import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const Home = lazy(() => import('../pages/Home').then((module) => ({ default: module.Home })));
const About = lazy(() => import('../pages/About').then((module) => ({ default: module.About })));
const Features = lazy(() => import('../pages/Features').then((module) => ({ default: module.Features })));
const Contact = lazy(() => import('../pages/Contact').then((module) => ({ default: module.Contact })));
const NotFound = lazy(() => import('../pages/NotFound').then((module) => ({ default: module.NotFound })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
