import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  isHovered: boolean;
}

export const useMouseFollower = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({
    x: -100,
    y: -100,
    isHovered: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive =
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button');

      setMousePos({
        x: e.clientX,
        y: e.clientY,
        isHovered: Boolean(isInteractive),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePos;
};
