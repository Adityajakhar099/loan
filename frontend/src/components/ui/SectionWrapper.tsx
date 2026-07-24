import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className,
  badge,
  title,
  subtitle,
}) => {
  return (
    <section id={id} className={cn('py-20 md:py-28 relative overflow-hidden', className)}>
      {(badge || title || subtitle) && (
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {badge}
            </div>
          )}
          {title && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
