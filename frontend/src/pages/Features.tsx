import React from 'react';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';

export const Features: React.FC = () => {
  return (
    <div className="pt-16">
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
};
