import { useEffect, useRef, RefObject } from 'react';
import { gsap, ScrollTrigger } from '../gsap';

export const usePinnedSection = <T extends HTMLElement = HTMLDivElement>(
  pinDurationRatio: number = 1
): RefObject<T> => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${window.innerHeight * pinDurationRatio}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
      });
    }, el);

    return () => ctx.revert();
  }, [pinDurationRatio]);

  return elementRef;
};
