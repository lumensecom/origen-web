import { useEffect } from 'react';

// Bloquea el scroll del body mientras `locked` sea true.
// Evita el "scroll chaining" de iOS donde, al llegar al final de un
// modal/overlay con scroll interno, el dedo sigue arrastrando y mueve
// la página de fondo en vez de quedarse quieto.
export default function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
