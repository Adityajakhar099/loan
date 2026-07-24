import { ReactNode } from 'react';

export type ThemeMode = 'dark';

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag: string;
  metrics?: string;
}

export interface StatItem {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  sources?: {
    documentName: string;
    section: string;
    page: number;
    confidence: number;
  }[];
}

export interface UnderwritingMetric {
  category: string;
  score: number;
  status: 'Optimal' | 'Caution' | 'Review';
  trend: string;
}

export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}
