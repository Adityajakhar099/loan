import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseFloatingOptions {
  distance?: number;
  duration?: number;
  rotateRange?: number;
}

export const useFloating = <T extends HTMLElement = HTMLDivElement>(
  options: UseFloatingOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { distance = 15, duration = 3.5, rotateRange = 3 } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: `-=${distance}`,
        rotation: rotateRange,
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, [distance, duration, rotateRange]);

  return elementRef;
};
