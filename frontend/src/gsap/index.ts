import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom Easing Presets for Luxury Motion Quality
 */
export const GSAP_EASINGS = {
  EXPO_OUT: 'expo.out',
  POWER4_OUT: 'power4.out',
  SMOOTH_CUBIC: 'cubic-bezier(0.16, 1, 0.3, 1)',
  BOUNCE_SOFT: 'back.out(1.4)',
};

/**
 * Factory for creating reusable reveal timelines
 */
export const createRevealTimeline = (
  target: string | HTMLElement,
  vars: gsap.TweenVars = {}
) => {
  const tl = gsap.timeline({
    defaults: {
      duration: 1.1,
      ease: GSAP_EASINGS.POWER4_OUT,
    },
  });

  tl.fromTo(
    target,
    {
      opacity: 0,
      y: 40,
      filter: 'blur(10px)',
    },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      stagger: 0.12,
      ...vars,
    }
  );

  return tl;
};

/**
 * Factory for 3D card tilt animation setup
 */
export const apply3DTilt = (element: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      rotationY: (x / rect.width) * 15,
      rotationX: (-y / rect.height) * 15,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.5,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      rotationY: 0,
      rotationX: 0,
      ease: 'power2.out',
      duration: 0.8,
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

export { gsap, ScrollTrigger };
