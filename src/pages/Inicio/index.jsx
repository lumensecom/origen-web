import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HERO_IMAGE, REAL_MEDIA, MR_SIVO_URL } from '../../constants/media';
import { CARTA } from '../../constants/menu';
import { BRAND_PHRASES, FEELINGS } from '../../constants/brand';
import { formatPrice } from '../../utils/format';
import { fadeUp, staggerContainer } from '../../components/ui/animations';
import FloatingLeaf from '../../components/ui/FloatingLeaf';
import LazyVideo from '../../components/ui/LazyVideo';
import Button from '../../components/ui/Button';

const HomeView = ({ navigate, onOpenVita }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [feeling, setFeeling] = useState(null);
  const selectedBowl = useMemo(() => (feeling ? CARTA.find(b => b.id === feeling.bowlId) : null), [feeling]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % BRAND_PHRASES.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Speech bubble cycle: appears at 1.8s, shows 3.2s, hides 7s, repeats
  useEffect(() => {
    let timer;
    const cycle = (delay) => {
      timer = setTimeout(() => {
        setShowBubble(true);
        timer = setTimeout(() => {
          setShowBubble(false);
          cycle(7000);
        }, 3200);
      }, delay);
    };
    cycle(1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative bg-[var(--fondo-crema)] pb-32">

      {/* Hero */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-[#050505]">
        <motion.div style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.15]) }} className="absolute inset-0 z-0">
          <img loading="eager" fetchPriority="high" src={HERO_IMAGE} alt="Origen Bowl" className="w-full h-full object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,40,24,0.4)] to-[rgba(5,25,12,0.9)]" />
        </motion.div>

        <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} className="font-logo text-5xl md:text-8xl text-white leading-[1.05] mb-6 drop-shadow-2xl">
            Nutrición desde<br />el origen.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }} className="font-display italic text-lg md:text-xl text-[var(--verde-menta)] font-light drop-shadow-md max-w-lg mx-auto">
            Recetas pensadas para alimentar tu cuerpo con la velocidad que necesitas y el sabor que mereces.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }} className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button onClick={() => navigate('menu')} variant="primary">Ver Carta <ArrowRight size={16} /></Button>
            <Button onClick={() => navigate('builder')} variant="ghost">Crear Mi Bowl <Sparkles size={16} /></Button>
          </motion.div>
        </motion.div>

      </div>

      {/* Widget "¿Cómo te sientes hoy?" */}
      <div className="max-w-5xl mx-auto px-4 relative z-30 -mt-10">
        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-[#E8F0E8] p-5 md:p-7">
          <AnimatePresence mode="wait">
            <motion.p key={phraseIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5 }} className="font-display italic text-base md:text-lg text-[var(--verde-profundo)] text-center mb-3 min-h-[1.75rem]">
              {BRAND_PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
          <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[var(--texto-suave)] mb-4 text-center">¿Cómo te sientes hoy?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {FEELINGS.map(f => (
              <button
                key={f.key}
                onClick={() => setFeeling(feeling?.key === f.key ? null : f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-ui text-sm font-semibold transition-all duration-300 active:scale-95 ${feeling?.key === f.key ? 'bg-[var(--verde-main)] text-white shadow-lg scale-105' : 'bg-[var(--fondo-crema)] text-[var(--verde-profundo)] hover:bg-[var(--verde-menta)] hover:scale-105'}`}
              >
                <span className="text-base">{f.emoji}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <motion.div
              className="relative flex-shrink-0"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <AnimatePresence>
                {showBubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 4 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 bg-[var(--verde-profundo)] text-white rounded-[12px] px-3 py-2 whitespace-nowrap shadow-lg z-10 pointer-events-none"
                  >
                    <p className="font-ui text-[11px] font-bold leading-none">¿Sin ideas? ¡Yo te ayudo! 🥦</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--verde-profundo)]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <img
                src={MR_SIVO_URL}
                alt="Mr. Sivo"
                className="h-16 w-auto object-contain drop-shadow-sm"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-display italic text-sm text-[var(--verde-profundo)] font-semibold leading-tight">¿No sabes qué comer hoy?</p>
              <p className="font-ui text-xs text-[var(--texto-suave)]">Mr. Sivo te ayuda a elegir</p>
            </div>
            <button onClick={onOpenVita} className="flex items-center gap-2 bg-[var(--terracota-vivo)] hover:bg-[var(--terracota-quemado)] text-white font-ui font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-md whitespace-nowrap flex-shrink-0">
              <Sparkles size={14} /> Pregúntale
            </button>
          </div>

          <AnimatePresence>
            {feeling && selectedBowl && (
              <motion.div key={feeling.key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--verde-menta)] flex-shrink-0 border border-gray-100">
                    {selectedBowl.imagen
                      ? <img loading="lazy" src={selectedBowl.imagen} alt={selectedBowl.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🥗</div>}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-ui text-xs text-[var(--texto-suave)] mb-1">{feeling.msg}</p>
                    <h4 className="font-display font-bold text-xl text-[var(--verde-profundo)]">{selectedBowl.nombre}</h4>
                    <p className="font-ui text-sm text-[var(--verde-main)] font-semibold">{formatPrice(selectedBowl.precio)}</p>
                  </div>
                  <button onClick={() => navigate('menu')} className="bg-[var(--verde-main)] text-white font-ui font-bold text-sm px-6 py-3 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
                    Ver en Carta <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cards de acceso rápido */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={staggerContainer} className="w-full flex flex-col md:flex-row bg-[var(--fondo-crema)] relative z-20 max-w-7xl mx-auto px-6 py-12 gap-6">
        <motion.div variants={fadeUp} onClick={() => navigate('builder')} className="relative flex-1 bg-[#E8EFE3] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-palido)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--terracota-suave)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mb-4 transition-transform duration-500 group-hover:-translate-y-1">Crea tu<br /><span className="text-[var(--terracota-quemado)]">Origen</span></h2>
            <p className="font-ui text-[var(--texto-suave)] max-w-xs text-base">Diseña tu obra maestra paso a paso con nuestros ingredientes frescos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--terracota-vivo)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <Sparkles size={24} />
          </div>
        </motion.div>
        <motion.div variants={fadeUp} onClick={() => navigate('menu')} className="relative flex-1 bg-[#E8EFE3] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-palido)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mb-4 transition-transform duration-500 group-hover:-translate-y-1">Carta<br /><span className="text-[var(--verde-main)]">Origen</span></h2>
            <p className="font-ui text-[var(--texto-suave)] max-w-xs text-base">Explora nuestras combinaciones perfectas diseñadas por expertos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--verde-profundo)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <ArrowRight size={24} />
          </div>
        </motion.div>
      </motion.div>

      {/* Quote */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="max-w-4xl mx-auto px-8 py-14 md:py-20 relative z-20 text-center">
        <span className="font-display text-7xl md:text-9xl text-[var(--terracota-vivo)] leading-none block -mb-4 select-none">"</span>
        <blockquote className="font-display italic text-2xl md:text-4xl text-[var(--verde-profundo)] leading-snug mb-6 px-4">
          Que tu alimento sea tu medicina,<br className="hidden md:block"/> y tu medicina sea tu alimento.
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-[var(--terracota-vivo)]" />
          <cite className="font-ui text-sm font-bold uppercase tracking-[0.2em] text-[var(--terracota-quemado)] not-italic">Hipócrates</cite>
          <span className="w-8 h-px bg-[var(--terracota-vivo)]" />
        </div>
      </motion.div>

      {/* Editorial + galería */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center bg-[var(--fondo-crema)] relative z-20 overflow-hidden">
        <FloatingLeaf className="top-4 right-[8%] hidden lg:block" size={32} delay={0.4} />
        <FloatingLeaf className="bottom-10 left-[4%] hidden lg:block" size={22} delay={1.2} color="var(--terracota-suave)" />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="grid grid-cols-2 gap-4 order-2 lg:order-1">
          <div className="space-y-4">
            <motion.div variants={fadeUp} className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5] relative group">
              <img loading="lazy" src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_RAIZ_ATUN_puhjsi.webp" alt="Origen Raíz" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square relative group">
              <img loading="lazy" src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_HUEVO_pgzav3.webp" alt="Origen Huevo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </motion.div>
          </div>
          <div className="space-y-4 pt-8">
            <motion.div variants={fadeUp} className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square relative group">
              <img loading="lazy" src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_LOMO_zqrfqh.webp" alt="Origen Lomo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5] relative group">
              <img loading="lazy" src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_COSECHA_LOMO_cfbzy9.webp" alt="Origen Cosecha" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={staggerContainer} className="flex flex-col justify-center order-1 lg:order-2">
          <motion.span variants={fadeUp} className="font-ui text-[var(--terracota-quemado)] font-bold tracking-[0.2em] uppercase text-xs mb-6 flex items-center gap-2">
            <span className="w-6 h-px bg-[var(--terracota-quemado)]" /> Nuestra Esencia
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display italic text-5xl md:text-6xl text-[var(--verde-profundo)] mb-8 leading-tight">
            Comer bien<br />nunca fue<br />tan fácil.
          </motion.h2>
          <motion.p variants={fadeUp} className="font-ui text-lg text-[var(--texto-suave)] leading-relaxed mb-10 max-w-lg">
            Creemos que la comida saludable debe ser deliciosa, rápida y accesible. Trabajamos de la mano con agricultores locales para traer los ingredientes más frescos a tu bowl, todos los días.
          </motion.p>
          <motion.button variants={fadeUp} onClick={() => { navigate('blog'); window.scrollTo(0, 0); }} className="w-max border-b-2 border-[var(--verde-main)] text-[var(--verde-profundo)] font-ui font-bold text-lg pb-1 hover:text-[var(--verde-main)] transition-colors flex items-center gap-2 group">
            Descubre nuestras historias <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Así es Origen */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} className="text-center mb-12">
          <span className="font-ui text-[var(--terracota-quemado)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Así es Origen</span>
          <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)]">Real, fresco y hecho<br className="hidden md:block" /> frente a ti.</h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div variants={fadeUp} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] group bg-[var(--verde-profundo)]">
            <LazyVideo src={REAL_MEDIA.videoTimelapse} poster={REAL_MEDIA.videoTimelapsePoster} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Tu bowl, armado al instante.</p>
          </motion.div>
          <motion.div variants={fadeUp} onClick={() => navigate('ubicaciones')} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] cursor-pointer group">
            <img loading="lazy" src={REAL_MEDIA.local} alt="Local Origen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Nuestro espacio te espera.</p>
            <span className="absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--verde-profundo)]">Ver ubicaciones</span>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] group">
            <img loading="lazy" src={REAL_MEDIA.pared1} alt="Espacio Origen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Vive la experiencia Origen.</p>
          </motion.div>
          <motion.div variants={fadeUp} onClick={() => { navigate('blog'); window.scrollTo(0, 0); }} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] cursor-pointer group">
            <img loading="lazy" src={REAL_MEDIA.staff1} alt="Equipo Origen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">El equipo detrás de cada bowl.</p>
            <span className="absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--verde-profundo)]">Leer historia</span>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} className="text-center mt-16 mb-8">
          <span className="font-ui text-[var(--terracota-quemado)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Nuestras Instalaciones</span>
          <h3 className="font-display italic text-2xl md:text-3xl text-[var(--verde-profundo)]">Un espacio pensado para ti.</h3>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[16/7] group">
          <LazyVideo src={REAL_MEDIA.videoLocal} poster={REAL_MEDIA.videoLocalPoster} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </div>

      {/* Membresía banner */}
      <div className="max-w-[1400px] mx-auto px-6 pb-16 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--verde-profundo)] rounded-[28px] px-8 py-7 border border-[var(--terracota-vivo)]/25 shadow-lg">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[14px] bg-[var(--terracota-vivo)]/15 flex items-center justify-center text-2xl shrink-0">🔒</div>
              <div>
                <span className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--terracota-vivo)] block mb-1">Próximamente</span>
                <h3 className="font-logo text-xl text-white leading-none">Club Membresía Origen</h3>
              </div>
            </div>
            <p className="font-ui text-sm text-white/50 max-w-xs text-center sm:text-right leading-relaxed">Descuentos, prioridad en pedidos y beneficios exclusivos para miembros.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeView;
