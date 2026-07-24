import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseRevealOptions {
  triggerOnScroll?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  yOffset?: number;
  blur?: boolean;
}

export const useReveal = <T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const {
    triggerOnScroll = true,
    delay = 0,
    duration = 1.2,
    stagger = 0.1,
    yOffset = 50,
    blur = true,
  } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none' });
      return;
    }

    const targets = el.children.length > 0 ? Array.from(el.children) : [el];

    gsap.set(targets, {
      opacity: 0,
      y: yOffset,
      filter: blur ? 'blur(12px)' : 'none',
    });

    const ctx = gsap.context(() => {
      const anim = gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        stagger,
        ease: 'power4.out',
        scrollTrigger: triggerOnScroll
          ? {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          : undefined,
      });
      return () => anim.kill();
    }, el);

    return () => ctx.revert();
  }, [triggerOnScroll, delay, duration, stagger, yOffset, blur]);

  return elementRef;
};
