import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const FloatingLeaf = ({ className = '', size = 28, delay = 0, color = 'var(--verde-palido)' }) => (
  <motion.div
    aria-hidden="true"
    className={`pointer-events-none absolute ${className}`}
    animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    <Leaf size={size} style={{ color }} strokeWidth={1.5} />
  </motion.div>
);

export default FloatingLeaf;
