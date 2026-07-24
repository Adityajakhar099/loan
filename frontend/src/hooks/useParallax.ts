import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseParallaxOptions {
  speed?: number; // Speed multiplier: positive = move up, negative = move down
  direction?: 'vertical' | 'horizontal';
}

export const useParallax = <T extends HTMLElement = HTMLDivElement>(
  options: UseParallaxOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { speed = 0.3, direction = 'vertical' } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        [direction === 'vertical' ? 'yPercent' : 'xPercent']: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed, direction]);

  return elementRef;
};
