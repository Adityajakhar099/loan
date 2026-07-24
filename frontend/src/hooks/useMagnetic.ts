import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseMagneticOptions {
  strength?: number; // Attraction strength (default: 0.3)
}

export const useMagnetic = <T extends HTMLElement = HTMLButtonElement>(
  options: UseMagneticOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { strength = 0.35 } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - (left + width / 2)) * strength;
      const y = (e.clientY - (top + height / 2)) * strength;

      gsap.to(el, {
        x,
        y,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
};
