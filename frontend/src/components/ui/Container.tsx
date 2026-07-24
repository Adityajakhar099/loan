import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'normal' | 'small' | 'wide';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = 'normal',
}) => {
  const sizeClasses = {
    small: 'max-w-4xl',
    normal: 'max-w-7xl',
    wide: 'max-w-[1440px]',
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 w-full', sizeClasses[size], className)}>
      {children}
    </div>
  );
};
