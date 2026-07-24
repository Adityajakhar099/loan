import React from 'react';
import { HeroFeature } from '../features/hero/HeroFeature';
import { FeaturesGrid } from '../features/features/FeaturesGrid';
import { HowItWorksFeature } from '../features/how-it-works/HowItWorksFeature';
import { AIChatPreview } from '../features/ai-preview/AIChatPreview';
import { DashboardPreview } from '../features/dashboard-preview/DashboardPreview';
import { EMIPreview } from '../features/emi-preview/EMIPreview';
import { BenefitsFeature } from '../features/benefits/BenefitsFeature';
import { TestimonialsFeature } from '../features/testimonials/TestimonialsFeature';
import { PricingFeature } from '../features/pricing/PricingFeature';
import { FAQFeature } from '../features/faq/FAQFeature';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroFeature />
      <FeaturesGrid />
      <HowItWorksFeature />
      <AIChatPreview />
      <DashboardPreview />
      <EMIPreview />
      <BenefitsFeature />
      <TestimonialsFeature />
      <PricingFeature />
      <FAQFeature />
    </div>
  );
};
