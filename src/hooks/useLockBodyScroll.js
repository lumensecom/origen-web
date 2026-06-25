import { useEffect } from 'react';

// iOS Safari requires position:fixed on body (not just overflow:hidden) to
// truly prevent background scroll while a modal is open. We save and restore
// the scroll offset so the page doesn't jump on close.
export default function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const scrollY = window.scrollY;
    const { overflow, position, top, width } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
