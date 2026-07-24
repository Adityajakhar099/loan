import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

interface UseSplitTextOptions {
  stagger?: number;
  duration?: number;
  delay?: number;
  type?: 'chars' | 'words';
}

export const useSplitText = <T extends HTMLElement = HTMLHeadingElement>(
  options: UseSplitTextOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { stagger = 0.03, duration = 0.8, delay = 0, type = 'words' } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const originalText = el.innerText;
    const tokens = type === 'chars' ? originalText.split('') : originalText.split(' ');

    el.innerHTML = '';
    const spanElements: HTMLSpanElement[] = [];

    tokens.forEach((token, i) => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(100%)';
      span.innerText = token + (type === 'words' && i < tokens.length - 1 ? '\u00A0' : '');
      el.appendChild(span);
      spanElements.push(span);
    });

    const ctx = gsap.context(() => {
      gsap.to(spanElements, {
        opacity: 1,
        y: '0%',
        duration,
        delay,
        stagger,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => {
      ctx.revert();
      if (el) el.innerText = originalText;
    };
  }, [stagger, duration, delay, type]);

  return elementRef;
};
