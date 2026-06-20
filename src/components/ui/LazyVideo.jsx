import { useRef } from 'react';
import { useInView } from 'framer-motion';

const LazyVideo = ({ src, poster, className = '', children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData;

  return (
    <div ref={ref} className={className}>
      {inView && !saveData ? (
        <video src={src} poster={poster} autoPlay loop muted playsInline preload="none" className="w-full h-full object-cover" />
      ) : (
        <img src={poster} alt="" loading="lazy" className="w-full h-full object-cover" />
      )}
      {children}
    </div>
  );
};

export default LazyVideo;
