import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = true,
  glow = false,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl glass-card p-6 relative overflow-hidden',
        hoverEffect && 'glass-card-hover',
        glow && 'border-sky-500/30 shadow-glow',
        className
      )}
    >
      {/* Subtle top inner highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
