import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '../gsap';

export const useHorizontalScroll = <
  TContainer extends HTMLElement = HTMLDivElement,
  TTrack extends HTMLElement = HTMLDivElement
>(): { containerRef: RefObject<TContainer>; trackRef: RefObject<TTrack> } => {
  const containerRef = useRef<TContainer>(null);
  const trackRef = useRef<TTrack>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;

    if (!container || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 80);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${track.scrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return { containerRef, trackRef };
};
