import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

const SIVO_MASCOT = 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto,f_auto,w_240/v1782441292/A_friendly_muscular_broccoli_character_202606252134-removebg-preview_vjtmnk.png';

const VITA_QUESTIONS = [
  {
    id: 'mood',
    question: '¿Cómo te sientes en este momento?',
    options: [
      { label: 'Sin energía', emoji: '😴', weights: { brasa: 2, tierra: 1 } },
      { label: 'Estresado/a', emoji: '😣', weights: { raiz: 2, vital: 1 } },
      { label: 'Antojado/a', emoji: '😋', weights: { fuego: 2, dulce: 1 } },
      { label: 'Tranquilo y feliz', emoji: '🙂', weights: { paraiso: 2, natural: 1 } },
      { label: 'Motivado/a', emoji: '💪', weights: { tierra: 2, aire: 1 } },
    ],
  },
  {
    id: 'goal',
    question: '¿Cuál es tu objetivo hoy?',
    options: [
      { label: 'Bajar de peso', emoji: '⚖️', weights: { aire: 2, natural: 1, agua: 1 } },
      { label: 'Ganar músculo', emoji: '🏋️', weights: { tierra: 2, brasa: 1, agua: 1 } },
      { label: 'Comer liviano', emoji: '🌿', weights: { natural: 2, vital: 1, raiz: 1 } },
      { label: 'Disfrutar sin culpa', emoji: '🎉', weights: { paraiso: 2, dulce: 1, fuego: 1 } },
    ],
  },
  {
    id: 'time',
    question: '¿Cuánto tiempo tienes para comer?',
    options: [
      { label: 'Tengo prisa', emoji: '🏃', weights: { dulce: 2, aire: 1, natural: 1 } },
      { label: 'Tiempo normal', emoji: '⏱️', weights: { cosecha: 2, brasa: 1, agua: 1 } },
      { label: 'Quiero disfrutar', emoji: '🍽️', weights: { paraiso: 2, tierra: 1, raiz: 1 } },
    ],
  },
  {
    id: 'craving',
    question: '¿Qué se te antoja en boca?',
    options: [
      { label: 'Fresco y cítrico', emoji: '🍋', weights: { agua: 2, paraiso: 1 } },
      { label: 'Intenso y sabroso', emoji: '🌶️', weights: { fuego: 2, brasa: 1 } },
      { label: 'Dulce y suave', emoji: '🍯', weights: { dulce: 2, cosecha: 1 } },
      { label: 'Vegetal y ligero', emoji: '🥦', weights: { natural: 2, vital: 1 } },
      { label: 'Sabor de mar', emoji: '🐟', weights: { raiz: 2, tierra: 1, agua: 1 } },
    ],
  },
  {
    id: 'restriction',
    question: '¿Tienes alguna preferencia alimentaria?',
    options: [
      { label: 'Sin restricciones', emoji: '✅', weights: { tierra: 1, brasa: 1, fuego: 1 } },
      { label: 'Vegetariano', emoji: '🌱', weights: { natural: 3, vital: 3 } },
      { label: 'Sin gluten', emoji: '🚫', weights: { agua: 2, aire: 2, tierra: 1 } },
      { label: 'Alto en proteína', emoji: '💪', weights: { tierra: 3, brasa: 2, agua: 2 } },
    ],
  },
];

export default function VitaWidget({ carta, formatPrice, onAddToCart, navigate, isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const isResult = step === VITA_QUESTIONS.length;

  const scores = answers.reduce((acc, weights) => {
    Object.entries(weights || {}).forEach(([id, val]) => { acc[id] = (acc[id] || 0) + val; });
    return acc;
  }, {});

  const recommended = (() => {
    let best = null, bestScore = -1;
    for (const bowl of carta) {
      const s = scores[bowl.id] || 0;
      if (s > bestScore) { bestScore = s; best = bowl; }
    }
    return best ?? carta[0];
  })();

  const selectOption = (weights) => {
    setAnswers(prev => {
      const next = [...prev];
      next[step] = weights;
      return next;
    });
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));
  const reset = () => { setStep(0); setAnswers([]); };
  const close = () => { onClose(); reset(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-[var(--fondo-crema)] w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-[var(--verde-profundo)] px-7 pt-5 pb-6 relative shrink-0">
              <button onClick={close} className="absolute top-5 right-5 p-2 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <img src={SIVO_MASCOT} alt="Mr. Sivo" className="w-10 h-10 object-contain drop-shadow-lg" />
                <div>
                  <h2 className="font-display italic text-2xl text-white leading-none">Mr. Sivo</h2>
                  <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-[var(--verde-palido)] mt-0.5">Tu asesor nutricional IA 🥦</p>
                </div>
              </div>

              {!isResult && (
                <div className="flex gap-1.5 mt-5">
                  {VITA_QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`h-1 flex-1 rounded-full transition-colors ${idx <= step ? 'bg-[var(--terracota-vivo)]' : 'bg-white/15'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto px-7 py-7">
              <AnimatePresence mode="wait">
                {!isResult ? (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--terracota-vivo)] mb-2">
                      Pregunta {step + 1} de {VITA_QUESTIONS.length}
                    </p>
                    <h3 className="font-display italic text-2xl text-[var(--verde-profundo)] mb-6 leading-snug">
                      {VITA_QUESTIONS[step].question}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {VITA_QUESTIONS[step].options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => selectOption(opt.weights)}
                          className="flex items-center gap-3 bg-white hover:bg-[var(--verde-menta)] border border-[var(--verde-palido)] hover:border-[var(--verde-main)] rounded-[16px] px-4 py-3.5 text-left transition-all duration-200 group"
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="font-ui font-semibold text-sm text-[var(--verde-profundo)] flex-1">{opt.label}</span>
                          <ArrowRight size={15} className="text-[var(--texto-suave)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                    {step > 0 && (
                      <button onClick={goBack} className="mt-5 flex items-center gap-1.5 font-ui text-xs font-bold text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] transition-colors">
                        <ArrowLeft size={14} /> Atrás
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <img src={SIVO_MASCOT} alt="Mr. Sivo" className="w-16 h-16 object-contain mb-2 drop-shadow-md" />
                    <p className="font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--verde-main)] mb-3">Mr. Sivo recomienda para ti</p>
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--verde-menta)] border border-[var(--verde-palido)] mb-4 shadow-md">
                      {recommended.imagen
                        ? <img src={recommended.imagen} alt={recommended.nombre} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">🥗</div>}
                    </div>
                    <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-1">{recommended.nombre}</h3>
                    <p className="font-ui text-sm text-[var(--texto-suave)] mb-3">Con {recommended.proteina} fresco, justo lo que tu cuerpo necesita hoy.</p>
                    <p className="font-display font-bold text-xl text-[var(--verde-main)] mb-6">{formatPrice(recommended.precio)}</p>

                    <div className="flex flex-col gap-2.5 w-full">
                      <button
                        onClick={() => { onAddToCart(recommended); close(); }}
                        className="w-full bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-sm py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(18,179,98,0.3)]"
                      >
                        Agregar a mi pedido <ShoppingBag size={16} />
                      </button>
                      <button
                        onClick={() => { navigate('menu'); close(); }}
                        className="w-full border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] font-ui font-bold text-sm py-3 rounded-[16px] hover:bg-[var(--verde-profundo)] hover:text-white transition-all"
                      >
                        Ver toda la carta
                      </button>
                      <button onClick={reset} className="font-ui text-xs font-bold text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] mt-1 transition-colors">
                        Volver a empezar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
