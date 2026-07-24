import React, { useEffect, useState } from 'react';
import { useMouseFollower } from '../../hooks/useMouseFollower';

export const CustomCursor: React.FC = () => {
  const { x, y, isHovered } = useMouseFollower();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (reducedMotion || x < 0 || y < 0) return null;

  return (
    <>
      {/* Small Precision Cursor Center Dot */}
      <div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-sky-400 rounded-full pointer-events-none z-[9999] transition-transform duration-75 ease-out shadow-glow"
        style={{
          transform: `translate3d(${x - 5}px, ${y - 5}px, 0) scale(${isHovered ? 1.5 : 1})`,
        }}
      />
      {/* Outer Glowing Spring Ring */}
      <div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-sky-400/40 bg-sky-500/10 pointer-events-none z-[9998] transition-all duration-300 ease-out backdrop-blur-[2px]"
        style={{
          transform: `translate3d(${x - 16}px, ${y - 16}px, 0) scale(${isHovered ? 2.2 : 1})`,
          borderColor: isHovered ? 'rgba(56, 189, 248, 0.8)' : 'rgba(56, 189, 248, 0.3)',
        }}
      />
    </>
  );
};
