import gsap from 'gsap';

/**
 * Reusable GSAP Animation Utilities for smooth UI entry & reveal effects.
 */

export const fadeInElement = (
  element: HTMLElement | string,
  delay: number = 0,
  duration: number = 0.8
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
    }
  );
};

export const staggerChildren = (
  container: HTMLElement | string,
  childSelector: string,
  staggerAmount: number = 0.15
) => {
  const target = typeof container === 'string' ? container : container;
  return gsap.fromTo(
    `${target} ${childSelector}`,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: staggerAmount,
      ease: 'power2.out',
    }
  );
};

export const pulseElement = (element: HTMLElement | string) => {
  return gsap.to(element, {
    scale: 1.05,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

export default gsap;
