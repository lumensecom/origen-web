import { motion, AnimatePresence } from 'framer-motion';
import { INGREDIENTE_COLORES } from '../../constants/menu';

const wobble = { scale: [1, 1.02, 1], rotate: [0, 2, -1, 0] };

const BowlSVG = ({ selections }) => (
  <motion.svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl overflow-visible">
    <ellipse cx="100" cy="180" rx="70" ry="15" fill="rgba(13,40,24,0.15)" filter="blur(8px)" />
    <circle cx="100" cy="100" r="95" fill="url(#kraftGrad)" />
    <circle cx="100" cy="100" r="90" fill="#E8D5B5" />
    <circle cx="100" cy="100" r="85" fill="#1A1A1A" opacity="0.05" />
    <defs>
      <radialGradient id="kraftGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#E6C8A6" />
        <stop offset="100%" stopColor="#C4905A" />
      </radialGradient>
    </defs>

    <AnimatePresence>
      {selections.base && (
        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="100" cy="100" r="82" fill={INGREDIENTE_COLORES[selections.base] || '#eee'} opacity={0.9} />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {selections.frescuras.map((fresc, idx) => (
        <motion.g key={fresc} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, ...wobble }} transition={{ type: 'spring', bounce: 0.5 }}>
          <circle cx={60 + idx * 20} cy={70 + idx * 30} r="18" fill={INGREDIENTE_COLORES[fresc] || '#7DC67E'} />
          <circle cx={40 + idx * 15} cy={90 + idx * 20} r="14" fill={INGREDIENTE_COLORES[fresc] || '#7DC67E'} opacity="0.8" />
        </motion.g>
      ))}
    </AnimatePresence>

    <AnimatePresence>
      {selections.sabores.map((sab, idx) => (
        <motion.g key={sab} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, ...wobble }} transition={{ type: 'spring', bounce: 0.5 }}>
          <circle cx={140 - idx * 20} cy={70 + idx * 30} r="16" fill={INGREDIENTE_COLORES[sab] || '#F0C040'} />
          <rect x={120 - idx * 10} y={90 + idx * 20} width="20" height="20" rx="5" fill={INGREDIENTE_COLORES[sab] || '#F0C040'} opacity="0.9" transform={`rotate(${idx * 45})`} />
        </motion.g>
      ))}
    </AnimatePresence>

    <AnimatePresence>
      {selections.proteina && (
        <motion.g initial={{ scale: 0, y: -50 }} animate={{ scale: 1, y: 0, ...wobble }} transition={{ type: 'spring', bounce: 0.6 }}>
          <path d="M70,120 Q100,70 130,120 Q100,160 70,120 Z" fill={INGREDIENTE_COLORES[selections.proteina] || '#E0A060'} />
          <path d="M75,115 Q100,80 125,115" stroke="rgba(0,0,0,0.1)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {selections.proteina.includes('Doble') && (
            <path d="M60,100 Q100,50 140,100 Q100,140 60,100 Z" fill={INGREDIENTE_COLORES[selections.proteina] || '#E0A060'} opacity="0.8" transform="translate(0, 15) scale(0.9)" />
          )}
        </motion.g>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {selections.salsa && (
        <motion.path
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}
          d="M50,100 Q75,70 100,100 T150,100"
          stroke={INGREDIENTE_COLORES[selections.salsa] || '#fff'} strokeWidth="6" fill="none" strokeLinecap="round"
        />
      )}
    </AnimatePresence>
  </motion.svg>
);

export default BowlSVG;
