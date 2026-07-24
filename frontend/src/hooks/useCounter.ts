import { useEffect, useState, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseCounterOptions {
  endValue: number;
  duration?: number;
  decimals?: number;
}

export const useCounter = <T extends HTMLElement = HTMLDivElement>(
  options: UseCounterOptions
): { ref: RefObject<T>; count: string } => {
  const { endValue, duration = 2, decimals = 0 } = options;
  const ref = useRef<T>(null);
  const [count, setCount] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const counterObj = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counterObj, {
        value: endValue,
        duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          setCount(counterObj.value.toFixed(decimals));
        },
      });
    }, el);

    return () => ctx.revert();
  }, [endValue, duration, decimals]);

  return { ref, count };
};
