import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'sky' | 'blue' | 'emerald' | 'amber';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = 'sky',
  className,
}) => {
  const variantStyles = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-glow tracking-wider uppercase select-none',
        variantStyles[variant],
        className
      )}
    >
      {icon || <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{children}</span>
    </div>
  );
};
