import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Leaf, MapPin, ArrowRight, Instagram, Facebook, User, Menu as MenuIcon, X, Sparkles, MessageCircle, Navigation, Check, ChevronDown, BookOpen, Store, ShoppingBag } from 'lucide-react';

/* =========================================================================
   SISTEMA DE DISEÑO & DATA OFICIAL
   ========================================================================= */

const COLORS = {
  verdeProfundo: '#0D2818',
  verdeBosque: '#1A3D28',
  verdeMain: '#2A6E48',
  verdeVivo: '#3DB87A',
  verdeBrillante: '#4CD98A',
  verdePalido: '#C8F0DC',
  verdeMenta: '#E8F9F0',
  doradoFuerte: '#D4A017',
  doradoSuave: '#F0C040',
  cremaCalido: '#FDF5E0',
  fondoCrema: '#FDFAF4',
  textoOscuro: '#0D1F0F',
  kraft: '#D4A574',
  maximoAmber: '#F09030'
};

const CARTA = [
  {
    id: 'tierra',
    nombre: 'ORIGEN TIERRA',
    proteina: 'Salmón',
    precio: 44900,
    imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=400',
    badge: { texto: 'Premium', color: '#C9A227', bg: '#F0E8D8' },
    ingredientes: ['Arroz blanco', 'Repollo', 'Aguacate', 'Pepino', 'Mango', 'Garbanzo', 'Salmón', 'Semillas'],
    tag: 'Mariscos',
    dietary: ['Gluten-Free', 'High-Protein']
  },
  {
    id: 'fuego',
    nombre: 'ORIGEN FUEGO',
    proteina: 'Camarón',
    precio: 39900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_CAMARON_errnem.webp',
    badge: { texto: 'Plant-Based', color: '#2D5A4A', bg: '#E8F5E8' },
    ingredientes: ['Mix asiático', 'Berenjena', 'Aguacate', 'Cherry', 'Lenteja', 'Arándanos', 'Camarón', 'Almendras'],
    tag: 'Mariscos',
    dietary: ['Raw', 'Gluten-Free']
  },
  {
    id: 'agua',
    nombre: 'ORIGEN AGUA',
    proteina: 'Atún',
    precio: 42900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_ATUN_qvtarw.webp',
    badge: { texto: 'Gluten-Free', color: '#315B7E', bg: '#F0F5F8' },
    ingredientes: ['Mix asiático', 'Pepino', 'Aguacate', 'Queso parmesano', 'Manzana', 'Arándanos', 'Atún', 'Semillas'],
    tag: 'Mariscos',
    dietary: ['Gluten-Free', 'High-Protein']
  },
  {
    id: 'raiz',
    nombre: 'ORIGEN RAÍZ',
    proteina: 'Atún en Yogurt',
    precio: 40900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_RAIZ_ATUN_puhjsi.webp',
    badge: { texto: 'Premium', color: '#C9A227', bg: '#F0E8D8' },
    ingredientes: ['Arroz blanco', 'Brócoli', 'Aguacate', 'Zanahoria', 'Champiñones', 'Mango', 'Atún yogurt', 'Almendras'],
    tag: 'Mariscos',
    dietary: ['High-Protein']
  },
  {
    id: 'aire',
    nombre: 'ORIGEN AIRE',
    proteina: 'Pechuga de Pollo',
    precio: 26900,
    imagen: null,
    badge: { texto: 'Favorito', color: '#2D5A4A', bg: '#E8F5E8' },
    ingredientes: ['Arroz integral', 'Pepino', 'Zuquini', 'Manzana', 'Arándanos', 'Garbanzo', 'Pollo', 'Semillas'],
    tag: 'Proteína Animal',
    dietary: ['Gluten-Free', 'High-Protein']
  },
  {
    id: 'brasa',
    nombre: 'ORIGEN BRASA',
    proteina: 'Carne',
    precio: 28900,
    imagen: null,
    badge: { texto: 'Grill', color: '#2D3A2D', bg: '#F5F5F5' },
    ingredientes: ['Arroz blanco', 'Zanahoria', 'Zuquini', 'Cherry', 'Champiñones', 'Parmesano', 'Carne', 'Semillas'],
    tag: 'Proteína Animal',
    dietary: ['High-Protein']
  },
  {
    id: 'dulce',
    nombre: 'ORIGEN DULCE',
    proteina: 'Lomo Miel Mostaza',
    precio: 28900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_LOMO_zqrfqh.webp',
    badge: { texto: 'Raw', color: '#D47A40', bg: '#F8F0E8' },
    ingredientes: ['Arroz blanco', 'Pepino', 'Zanahoria', 'Repollo encurtido', 'Maíz', 'Aguacate', 'Lomo', 'Almendras'],
    tag: 'Proteína Animal',
    dietary: ['Gluten-Free']
  },
  {
    id: 'cosecha',
    nombre: 'ORIGEN COSECHA',
    proteina: 'Lomo de Cerdo',
    precio: 27900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_COSECHA_LOMO_cfbzy9.webp',
    badge: { texto: 'Temporada', color: '#2D5A4A', bg: '#E8F5E8' },
    ingredientes: ['Quinua', 'Berenjena', 'Pepino', 'Repollo', 'Garbanzo', 'Mango', 'Lomo cerdo', 'Semillas'],
    tag: 'Proteína Animal',
    dietary: ['Gluten-Free']
  },
  {
    id: 'paraiso',
    nombre: 'ORIGEN PARAÍSO',
    proteina: 'Pechuga',
    precio: 26900,
    imagen: null,
    badge: { texto: 'Frutal', color: '#D47A40', bg: '#F8F0E8' },
    ingredientes: ['Cogollo', 'Zanahoria', 'Mango', 'Manzana', 'Aguacate', 'Kiwi', 'Fresa', 'Pechuga', 'Maní', 'Salsa'],
    tag: 'Proteína Animal',
    dietary: ['Raw']
  },
  {
    id: 'natural',
    nombre: 'ORIGEN NATURAL',
    proteina: 'Huevo Cocido',
    precio: 19900,
    imagen: 'https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_HUEVO_pgzav3.webp',
    badge: { texto: 'Plant-Based', color: '#2D5A4A', bg: '#E8F5E8' },
    ingredientes: ['Mix asiático', 'Cherry', 'Zanahoria', 'Aguacate', 'Arándanos', 'Champiñones', 'Huevos', 'Semillas'],
    tag: 'Vegano',
    dietary: ['Gluten-Free', 'Vegan']
  },
  {
    id: 'vital',
    nombre: 'ORIGEN VITAL',
    proteina: 'Tofu',
    precio: 22900,
    imagen: null,
    badge: { texto: '100% Plant', color: '#2D5A4A', bg: '#E8F5E8' },
    ingredientes: ['Quinua', 'Zuquini', 'Zanahoria', 'Repollo', 'Mango', 'Champiñones', 'Tofu', 'Semillas'],
    tag: 'Vegano',
    dietary: ['Vegan', 'Gluten-Free']
  },
  {
    id: 'maximo',
    nombre: 'ORIGEN MÁXIMO',
    proteina: 'Doble Proteína',
    precio: 30900,
    imagen: null,
    badge: { texto: '⚡ Máximo', color: '#C9A227', bg: '#F0E8D8' },
    ingredientes: ['Arroz integral', 'Zanahoria', 'Brócoli', 'Pepino', 'Maíz', 'Champiñones', 'Pechuga doble', 'Semillas'],
    tag: 'Proteína Animal',
    esMaximo: true,
    dietary: ['High-Protein']
  }
];

const INGREDIENTE_COLORES = {
  'Arroz Blanco': '#F5F0E8', 'Arroz Integral': '#C8A87A', 'Quinoa': '#D4B896', 'Mix Asiático': '#E8D4B0',
  'Zuquini': '#7DC67E', 'Pepino': '#A8D87A', 'Tomate Cherry': '#E8584A', 'Zanahoria': '#F08030',
  'Repollo Encurtido': '#C870A8', 'Cebolla Encurtida': '#E0A0C8', 'Berenjena': '#6040A0', 'Brócoli': '#40A040',
  'Maíz': '#FFD040', 'Mango': '#F0A030', 'Manzana': '#E87080', 'Parmesano': '#F0E0A0',
  'Aguacate': '#80C060', 'Jalapeños': '#40A040', 'Lenteja Crocante': '#C87820', 'Garbanzos': '#D4A050',
  'Pechuga de Pollo': '#E0A060', 'Huevo Cocido': '#F8D870', 'Tofu': '#F0E8D0',
  'Carne': '#8B4020', 'Lomo de Cerdo': '#A05030', 'Máximo (Doble)': '#E0A060',
  'Pesto Natural': '#3DB870', 'Yogurt de Casa': '#F8F8F8', 'Mango Picante': '#F08030',
  'Dulce Balance': '#F8D040', 'Vino Mango': '#8040A0'
};

const HERO_IMAGE = "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780260556/A_hand_with_warm_natural_202605311437_jtu8or.jpg";

/* =========================================================================
   UTILIDADES
   ========================================================================= */

const formatPrice = (price) => `$${price.toLocaleString('es-CO')}`;

const generarMensajeWhatsApp = (pedido) => {
  const msg = `🌿 *PEDIDO ORIGEN*\n\n🥣 *${pedido.nombre}* — ${formatPrice(pedido.precio)}\n${pedido.esBuilder ? `📋 *Mi combinación:*\n• Base: ${pedido.base}\n• Frescuras: ${pedido.frescuras.join(', ')}\n• Sabores: ${pedido.sabores.join(', ')}\n• Proteína: ${pedido.proteina}\n• Salsa: ${pedido.salsa}\n` : ''}\n📍 *Modalidad:* ${pedido.modalidad}\n\n¡Gracias! 🌿`;
  window.open(`https://wa.me/573000000000?text=${encodeURIComponent(msg)}`, '_blank');
};

/* =========================================================================
   COMPONENTES UI
   ========================================================================= */

const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const base = "px-8 py-3.5 rounded-[16px] font-ui font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(42,110,72,0.25)]",
    ghost: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5",
    outline: "border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] hover:bg-[var(--verde-profundo)] hover:text-white"
  };
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

/* =========================================================================
   MODAL DE SELECCIÓN DE PEDIDO
   ========================================================================= */
const OrderModal = ({ pedido, onClose, onConfirm }) => {
  if (!pedido) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--fondo-crema)] w-full max-w-lg p-8 md:p-10 rounded-[32px] shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
          <div className="text-center mb-8">
            <span className="inline-block bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full text-xs font-bold font-ui uppercase tracking-wider mb-4">
              Paso Final
            </span>
            <h2 className="font-display italic text-4xl text-[var(--verde-profundo)] mb-2">Ordena tu Origen</h2>
            <p className="font-ui text-[var(--texto-suave)]">¿Cómo prefieres recibir tu bowl hoy?</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => onConfirm('Recoger en Local')} className="flex items-center gap-5 p-6 bg-white border border-[var(--verde-palido)] rounded-[24px] hover:border-[var(--verde-main)] hover:shadow-[0_10px_30px_rgba(42,110,72,0.15)] group transition-all duration-300 text-left">
              <div className="bg-[var(--verde-menta)] p-4 rounded-[16px] text-[var(--verde-main)] group-hover:scale-110 group-hover:bg-[var(--verde-main)] group-hover:text-white transition-all">
                <Store size={28} />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-1">Recoger en local</h3>
                <p className="font-ui text-sm text-[var(--texto-suave)]">Pasa por tu bowl a Salitre Plaza, sin filas.</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-[var(--verde-palido)] group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={() => onConfirm('Domicilio')} className="flex items-center gap-5 p-6 bg-white border border-[var(--verde-palido)] rounded-[24px] hover:border-[var(--verde-main)] hover:shadow-[0_10px_30px_rgba(42,110,72,0.15)] group transition-all duration-300 text-left">
              <div className="bg-[var(--verde-menta)] p-4 rounded-[16px] text-[var(--verde-main)] group-hover:scale-110 group-hover:bg-[var(--verde-main)] group-hover:text-white transition-all">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-1">Pedir a domicilio</h3>
                <p className="font-ui text-sm text-[var(--texto-suave)]">Te lo llevamos a donde estés, rápido y fresco.</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-[var(--verde-palido)] group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* =========================================================================
   GLOBAL FOOTER
   ========================================================================= */
const Footer = ({ navigate }) => {
  const handleNav = (id) => {
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050505] pt-20 pb-12 border-t border-white/5 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <h2 className="font-display font-bold text-3xl tracking-widest mb-4">ORIGEN</h2>
          <p className="font-ui text-white/50 text-sm mb-6 max-w-sm">Comida saludable, rápida y de verdad. Preparada al instante para nutrir tu cuerpo sin aburrir tu paladar.</p>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-brillante)] hover:text-black transition-colors"><Instagram size={18}/></button>
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-brillante)] hover:text-black transition-colors"><Facebook size={18}/></button>
          </div>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Explorar</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('menu')} className="hover:text-[var(--verde-brillante)] transition-colors">Carta Origen</button></li>
            <li><button onClick={() => handleNav('builder')} className="hover:text-[var(--verde-brillante)] transition-colors">Arma tu Bowl</button></li>
            <li><button onClick={() => handleNav('blog')} className="hover:text-[var(--verde-brillante)] transition-colors">Historias / Blog</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Visítanos</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-brillante)] transition-colors">Salitre Plaza</button></li>
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-brillante)] transition-colors">Horarios de Atención</button></li>
            <li><button onClick={() => handleNav('cuenta')} className="hover:text-[var(--verde-brillante)] transition-colors">Mi Cuenta / Puntos</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">¿Dudas o Antojos?</h4>
          <p className="font-ui text-sm text-white/50 mb-4">Pregúntale a nuestro equipo directamente por WhatsApp.</p>
          <button
            onClick={() => window.open('https://wa.me/573000000000', '_blank')}
            className="w-full bg-white text-black hover:bg-[var(--verde-brillante)] rounded-[16px] px-6 py-3 font-ui font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <MessageCircle size={18}/> Contactar Soporte
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-ui text-xs text-white/40">© 2026 ORIGEN. Todos los derechos reservados.</p>
        <div className="flex gap-6 font-ui text-xs text-white/40">
          <button className="hover:text-white transition-colors">Términos y Condiciones</button>
          <button className="hover:text-white transition-colors">Políticas de Privacidad</button>
        </div>
      </div>
    </footer>
  );
};

/* =========================================================================
   VISTAS
   ========================================================================= */

// --- 1. HOME ---
const HomeView = ({ navigate }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="w-full relative bg-[var(--fondo-crema)] pb-32">

      {/* Hero */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-[#050505]">
        <motion.div style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.15]) }} className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Origen Bowl" className="w-full h-full object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,40,24,0.4)] to-[rgba(13,40,24,0.85)]"></div>
        </motion.div>

        <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="font-display italic uppercase tracking-[0.3em] text-[12px] md:text-[14px] text-white/80 mb-6">Bogotá · Comida Saludable</p>
          <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-[1.05] mb-6 drop-shadow-2xl">
            Nutrición desde<br/>el origen.
          </h1>
          <p className="font-ui text-lg md:text-xl text-[var(--verde-menta)] font-light drop-shadow-md">
            Donde comer bien no es aburrido.
          </p>
        </motion.div>
      </div>

      {/* Barra de Confianza */}
      <div className="w-full bg-[var(--verde-bosque)] border-y border-[var(--verde-vivo)]/20 py-4 overflow-hidden flex relative z-20 shadow-lg">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, ease: "linear", repeat: Infinity }} className="flex w-max">
          {[1, 2, 3, 4].map((_, idx) => (
            <div key={idx} className="flex items-center gap-12 px-6">
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-brillante)]">🌿</span> 100% Natural</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-brillante)]">⚡</span> Alto en Proteína</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-brillante)]">🎯</span> 12 Combinaciones</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-brillante)]">📍</span> Bogotá</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bloques de Acción */}
      <div className="w-full flex flex-col md:flex-row bg-[var(--fondo-crema)] relative z-20 max-w-7xl mx-auto px-6 py-12 gap-6">
        <div onClick={() => navigate('builder')} className="relative flex-1 bg-[var(--verde-profundo)] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-bosque)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--verde-main)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-white mb-4 transition-transform duration-500 group-hover:-translate-y-1">Arma tu<br/><span className="text-[var(--verde-brillante)]">Origen</span></h2>
            <p className="font-ui text-[var(--verde-palido)] max-w-xs text-base">Crea tu obra maestra paso a paso con nuestros ingredientes frescos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--verde-brillante)] text-[var(--verde-profundo)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <Sparkles size={24} />
          </div>
        </div>
        <div onClick={() => navigate('menu')} className="relative flex-1 bg-[var(--crema-calido)] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--dorado-suave)]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mb-4 transition-transform duration-500 group-hover:-translate-y-1">Carta<br/><span className="text-[var(--verde-main)]">Origen</span></h2>
            <p className="font-ui text-[var(--texto-suave)] max-w-xs text-base">Explora nuestras 12 combinaciones perfectas diseñadas por expertos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--verde-profundo)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <ArrowRight size={24} />
          </div>
        </div>
      </div>

      {/* Sección Editorial */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center bg-[var(--fondo-crema)] relative z-20">

        <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5]">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_RAIZ_ATUN_puhjsi.webp" alt="Origen Raíz" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_HUEVO_pgzav3.webp" alt="Origen Huevo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_LOMO_zqrfqh.webp" alt="Origen Lomo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5]">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_COSECHA_LOMO_cfbzy9.webp" alt="Origen Cosecha" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center order-1 lg:order-2">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-6 flex items-center gap-2">
            <span className="w-6 h-px bg-[var(--verde-main)]"></span> Nuestra Esencia
          </span>
          <h2 className="font-display italic text-5xl md:text-6xl text-[var(--verde-profundo)] mb-8 leading-tight">
            Comer bien<br/>nunca fue<br/>tan fácil.
          </h2>
          <p className="font-ui text-lg text-[var(--texto-suave)] leading-relaxed mb-10 max-w-lg">
            Creemos que la comida saludable debe ser deliciosa, rápida y accesible. Trabajamos de la mano con agricultores locales para traer los ingredientes más frescos a tu bowl, todos los días. Preparado frente a ti, a tu ritmo.
          </p>
          <button onClick={() => { navigate('blog'); window.scrollTo(0, 0); }} className="w-max border-b-2 border-[var(--verde-main)] text-[var(--verde-profundo)] font-ui font-bold text-lg pb-1 hover:text-[var(--verde-main)] transition-colors flex items-center gap-2 group">
            Descubre nuestras historias <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. CARTA ---
const CartaView = ({ onOrderRequest }) => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const categorias = ['Todos', 'Mariscos', 'Proteína Animal', 'Vegano', 'Premium'];

  const bowlsFiltrados = useMemo(() => {
    return CARTA.filter(bowl => {
      if (filtroActivo === 'Todos') return true;
      if (filtroActivo === 'Premium') return bowl.badge.texto === 'Premium' || bowl.esMaximo;
      return bowl.tag === filtroActivo;
    });
  }, [filtroActivo]);

  return (
    <div className="pt-32 pb-32 bg-[#FAFAFA] w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="text-center mb-16 animate-in">
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Carta Origen</h1>
          <p className="font-ui text-lg text-[#2D5A4A]">12 combinaciones perfectas, cada una con su historia.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-hide animate-in justify-start md:justify-center" style={{ animationDelay: '200ms' }}>
          {categorias.map((t, i) => (
            <button
              key={i}
              onClick={() => setFiltroActivo(t)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-[12px] font-ui text-sm font-semibold transition-all duration-300 ${filtroActivo === t ? 'bg-[#2D5A4A] text-white shadow-md' : 'bg-white border border-[#E8F0E8] text-[#2D3A2D] hover:bg-[#F5F5F5]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {bowlsFiltrados.map((bowl) => (
              <motion.div
                layout
                key={bowl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8F0E8] hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-[540px] relative group cursor-pointer"
                onClick={() => onOrderRequest(bowl)}
              >
                <div className="absolute top-6 left-6 z-20">
                  <span
                    className="px-3 py-1.5 rounded-[12px] text-[10px] font-ui font-bold uppercase tracking-wide"
                    style={{ backgroundColor: bowl.badge.bg, color: bowl.badge.color }}
                  >
                    {bowl.badge.texto}
                  </span>
                </div>

                <div className="w-[200px] h-[200px] mx-auto rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] bg-[#FDFCF8] flex items-center justify-center overflow-hidden mb-6 relative z-10">
                  {bowl.imagen ? (
                    <img
                      src={bowl.imagen}
                      alt={bowl.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E8F5E8] flex items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-105">🥗</div>
                  )}
                </div>

                <div className="flex-grow flex flex-col items-center">
                  <h3 className="font-display font-bold text-[22px] text-[#1A1A1A] leading-[1.2] text-center mb-4">
                    {bowl.nombre}
                  </h3>

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {bowl.ingredientes.map((ing, i) => (
                      <span key={i} className="bg-[#F5F5F5] text-[#2D3A2D] text-[10px] font-medium px-2.5 py-1 rounded-[6px]">
                        {ing}
                      </span>
                    ))}
                  </div>

                  {bowl.dietary && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {bowl.dietary.map((tag, i) => (
                        <span key={i} className="bg-[#E8F5E8] text-[#2D5A4A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col items-center w-full">
                  <div className="font-display font-bold text-[26px] text-[#D4A840] mb-4">
                    {formatPrice(bowl.precio)}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onOrderRequest(bowl); }}
                    className="w-full rounded-[24px] border-2 border-[#1A1A1A] text-[#1A1A1A] bg-white text-[13px] font-bold uppercase tracking-wide py-3 hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex justify-center items-center gap-2 group-hover:-translate-y-0.5"
                  >
                    Añadir al pedido <ShoppingBag size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

// --- 3. BOWL BUILDER ---
const BowlSVG = ({ selections }) => {
  const wobble = { scale: [1, 1.02, 1], rotate: [0, 2, -1, 0] };
  return (
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
            <circle cx={60 + (idx * 20)} cy={70 + (idx * 30)} r="18" fill={INGREDIENTE_COLORES[fresc] || '#7DC67E'} />
            <circle cx={40 + (idx * 15)} cy={90 + (idx * 20)} r="14" fill={INGREDIENTE_COLORES[fresc] || '#7DC67E'} opacity="0.8" />
          </motion.g>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {selections.sabores.map((sab, idx) => (
          <motion.g key={sab} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, ...wobble }} transition={{ type: 'spring', bounce: 0.5 }}>
            <circle cx={140 - (idx * 20)} cy={70 + (idx * 30)} r="16" fill={INGREDIENTE_COLORES[sab] || '#F0C040'} />
            <rect x={120 - (idx * 10)} y={90 + (idx * 20)} width="20" height="20" rx="5" fill={INGREDIENTE_COLORES[sab] || '#F0C040'} opacity="0.9" transform={`rotate(${idx * 45})`} />
          </motion.g>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {selections.proteina && (
          <motion.g initial={{ scale: 0, y: -50 }} animate={{ scale: 1, y: 0, ...wobble }} transition={{ type: 'spring', bounce: 0.6 }}>
            <path d="M70,120 Q100,70 130,120 Q100,160 70,120 Z" fill={INGREDIENTE_COLORES[selections.proteina] || '#E0A060'} />
            <path d="M75,115 Q100,80 125,115" stroke="rgba(0,0,0,0.1)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selections.salsa && (
          <motion.path
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
            d="M50,100 Q75,70 100,100 T150,100"
            stroke={INGREDIENTE_COLORES[selections.salsa] || '#fff'} strokeWidth="6" fill="none" strokeLinecap="round"
          />
        )}
      </AnimatePresence>
    </motion.svg>
  );
};

const BuilderView = ({ onOrderRequest }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ base: '', frescuras: [], sabores: [], proteina: '', salsa: '' });

  const toggleSelection = (category, item, max) => {
    setSelections(prev => {
      const current = prev[category];
      if (Array.isArray(current)) {
        if (current.includes(item)) return { ...prev, [category]: current.filter(i => i !== item) };
        if (current.length < max) return { ...prev, [category]: [...current, item] };
        return prev;
      }
      return { ...prev, [category]: item === current ? '' : item };
    });
  };

  const isMaximo = selections.proteina === 'Máximo (Doble)';
  const totalPrice = 24900 + (isMaximo ? 6000 : 0);

  const OPTIONS = {
    1: { id: 'base', max: 1, icon: '🌾', title: '¿Cuál es tu base?', sub: 'La fundación de tu bowl', items: ['Arroz Blanco', 'Arroz Integral', 'Quinoa', 'Mix Asiático'] },
    2: { id: 'frescuras', max: 2, icon: '🥦', title: 'Tus frescuras', sub: 'Elige hasta 2 — frescas y crujientes', items: ['Zuquini', 'Pepino', 'Tomate Cherry', 'Zanahoria', 'Repollo Encurtido', 'Cebolla Encurtida', 'Berenjena', 'Brócoli'] },
    3: { id: 'sabores', max: 2, icon: '✨', title: 'Sabores especiales', sub: 'Lo que hace único a tu bowl — elige hasta 2', items: ['Maíz', 'Mango', 'Manzana', 'Parmesano', 'Aguacate', 'Jalapeños', 'Lenteja Crocante', 'Garbanzos'] },
    4: { id: 'proteina', max: 1, icon: '⚡', title: 'Tu proteína', sub: 'El corazón de tu bowl', items: ['Pechuga de Pollo', 'Huevo Cocido', 'Tofu', 'Carne', 'Lomo de Cerdo', 'Máximo (Doble)'] },
    5: { id: 'salsa', max: 1, icon: '🌿', title: 'El toque final', sub: 'La salsa que lo une todo', items: ['Pesto Natural', 'Yogurt de Casa', 'Mango Picante', 'Dulce Balance', 'Vino Mango'] }
  };

  const curr = OPTIONS[step];

  return (
    <div className="pt-24 bg-[var(--fondo-crema)] w-full flex flex-col lg:flex-row min-h-screen pb-16 lg:pb-0">
      <div className="w-full lg:w-1/2 bg-[var(--verde-profundo)] text-white p-6 lg:p-12 lg:min-h-screen flex flex-col relative z-20">
        <div className="mb-10">
          <h1 className="font-display italic text-4xl md:text-5xl text-white mb-2">Arma tu <span className="text-[var(--verde-brillante)]">Origen</span></h1>
          <p className="font-ui text-[var(--verde-menta)] opacity-80">5 pasos. Infinitas combinaciones.</p>
        </div>

        <div className="lg:hidden sticky top-20 bg-[var(--verde-bosque)]/95 backdrop-blur-md p-4 rounded-[16px] mb-8 flex justify-between items-center border border-[var(--verde-vivo)]/20 z-[60] shadow-lg">
          <span className="font-ui text-sm text-[var(--verde-palido)]">Tu Bowl en vivo:</span>
          <motion.span key={totalPrice} className={`font-display font-bold text-2xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-white'}`}>{formatPrice(totalPrice)}</motion.span>
        </div>

        {step <= 5 ? (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{curr.icon}</span>
                <div>
                  <h2 className="font-ui font-bold text-2xl">{curr.title}</h2>
                  <p className="font-accent text-lg text-[var(--verde-palido)]">{curr.sub}</p>
                </div>
              </div>

              <div className={`grid gap-4 ${step === 4 || step === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {curr.items.map(item => {
                  const isArray = Array.isArray(selections[curr.id]);
                  const isSelected = isArray ? selections[curr.id].includes(item) : selections[curr.id] === item;
                  const isDisabled = isArray && !isSelected && selections[curr.id].length >= curr.max;
                  const isMaxCard = item === 'Máximo (Doble)';

                  return (
                    <button
                      key={item}
                      onClick={() => toggleSelection(curr.id, item, curr.max)}
                      disabled={isDisabled}
                      className={`text-left p-4 rounded-[16px] transition-all duration-300 font-ui ${
                        isMaxCard
                          ? (isSelected ? 'bg-[var(--maximo-amber)] text-[var(--verde-profundo)] border-[var(--maximo-amber)] shadow-[0_0_20px_rgba(240,144,48,0.4)]' : 'bg-gradient-to-r from-[#1A3D28] to-[#0D2818] border-[#F09030] text-[#F09030] hover:bg-[#F09030]/10')
                          : (isSelected ? 'bg-[var(--verde-brillante)] text-[var(--verde-profundo)] border-[var(--verde-vivo)]' : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-menta)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]')
                      } border-2 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between group`}
                    >
                      <div>
                        <div className={`font-bold text-lg mb-1 ${isMaxCard && !isSelected ? 'text-[#F09030]' : ''}`}>{isMaxCard ? '⚡ MÁXIMO' : item}</div>
                        {isMaxCard && <div className="text-xs opacity-80">+ $6.000 Doble Proteína</div>}
                      </div>
                      <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-[var(--verde-profundo)] bg-[var(--verde-profundo)] text-[var(--verde-brillante)]' : 'border-current opacity-30'}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bg-[var(--verde-bosque)] p-8 rounded-[24px] border border-[var(--verde-vivo)]/20">
            <h2 className="font-display italic text-3xl mb-6 text-[var(--verde-brillante)]">🌿 Tu Origen está listo</h2>
            <div className="space-y-3 font-ui text-[var(--verde-menta)] mb-8">
              <p>• <strong className="text-white">Base:</strong> {selections.base}</p>
              <p>• <strong className="text-white">Frescuras:</strong> {selections.frescuras.join(' + ')}</p>
              <p>• <strong className="text-white">Sabores:</strong> {selections.sabores.join(' + ')}</p>
              <p>• <strong className="text-white">Proteína:</strong> {selections.proteina}</p>
              <p>• <strong className="text-white">Salsa:</strong> {selections.salsa}</p>
            </div>
            <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-center">
              <span className="font-ui text-lg">Total a pagar:</span>
              <span className={`font-display font-bold text-3xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-[var(--verde-brillante)]'}`}>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => onOrderRequest({ nombre: 'BOWL PERSONALIZADO', precio: totalPrice, esBuilder: true, ...selections })} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-[16px]">Pedir y Finalizar</Button>
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-[16px] border border-white/20 hover:bg-white/10 transition font-ui font-semibold text-sm">Modificar</button>
            </div>
          </motion.div>
        )}

        {step <= 5 && (
          <div className="mt-auto pt-10 pb-4 flex justify-between items-center z-50">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} className={`font-ui font-semibold text-sm text-[var(--verde-palido)] hover:text-white transition ${step === 1 ? 'opacity-0' : ''}`}>← Volver</button>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-2 rounded-[4px] transition-all duration-300 ${i === step ? 'w-8 bg-[var(--verde-brillante)]' : 'w-2 bg-white/20'}`} />)}
            </div>
            <Button onClick={() => setStep(s => Math.min(6, s + 1))} variant="primary" className="bg-[var(--verde-brillante)] text-[var(--verde-profundo)] hover:bg-[var(--verde-vivo)] rounded-[16px]">
              {step === 5 ? 'Finalizar' : 'Siguiente'} <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <div className="w-full lg:w-1/2 bg-[var(--fondo-crema)] relative min-h-[50vh] lg:min-h-screen">
        <div className="sticky top-20 lg:top-1/2 lg:-translate-y-1/2 p-8 lg:p-12 flex flex-col items-center justify-center">
          <div className="hidden lg:flex w-full max-w-sm bg-white p-6 rounded-[24px] mb-12 shadow-sm justify-between items-center border border-[var(--verde-palido)]">
            <div>
              <p className="font-ui text-xs text-[var(--texto-suave)] uppercase tracking-wider font-bold mb-1">Tu Bowl:</p>
              <motion.p key={totalPrice} className={`font-display font-bold text-3xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-[var(--verde-profundo)]'}`}>{formatPrice(totalPrice)}</motion.p>
            </div>
            {isMaximo && <div className="bg-[var(--maximo-amber)]/10 text-[var(--maximo-amber)] px-3 py-1 rounded-[8px] text-xs font-bold animate-pulse">POWER UP</div>}
          </div>
          <div className="w-full max-w-[300px] lg:max-w-[450px] aspect-square relative z-10">
            <BowlSVG selections={selections} />
          </div>
          {step <= 5 && <p className="font-accent italic text-xl text-[var(--texto-suave)] mt-8 text-center animate-pulse">Visualización en tiempo real...</p>}
        </div>
      </div>
    </div>
  );
};

// --- 4. BLOG ---
const BlogView = ({ navigate }) => {
  const posts = [
    { title: "El poder del aguacate en tu día a día", img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600", category: "Nutrición" },
    { title: "Nuestros agricultores: Conoce a Don Luis", img: "https://images.unsplash.com/photo-1595856320586-30232402b1f8?auto=format&fit=crop&q=80&w=600", category: "Comunidad" },
    { title: "¿Por qué elegimos salmón de pesca sostenible?", img: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=600", category: "Ingredientes" }
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-in">
          <h1 className="font-display italic text-5xl md:text-6xl text-[var(--verde-profundo)] mb-4">Historias de Origen</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)]">Nutrición, comunidad y el porqué detrás de lo que hacemos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '200ms' }}>
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white rounded-[24px] overflow-hidden border border-[var(--verde-palido)] shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-[8px] font-ui text-[10px] uppercase font-bold text-[var(--verde-main)]">
                  {post.category}
                </div>
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-4 line-clamp-2">{post.title}</h3>
                <span className="font-ui text-[var(--verde-main)] font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">Leer artículo <ArrowRight size={16}/></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-[var(--verde-profundo)] rounded-[24px] p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display italic text-4xl mb-4">¿Quieres saber más sobre nutrición?</h2>
            <p className="font-ui text-[var(--verde-palido)] mb-8">Pregúntale a nuestra IA personalizada o únete a nuestro newsletter.</p>
            <Button onClick={() => { navigate('cuenta'); window.scrollTo(0, 0); }} className="mx-auto rounded-[16px] bg-[var(--verde-brillante)] text-[var(--verde-profundo)] hover:bg-[var(--verde-vivo)]">
              <Sparkles size={18}/> Hablar con Asesor Nutricional
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. UBICACIONES ---
const UbicacionesView = () => (
  <div className="pt-32 pb-32 min-h-screen bg-[var(--verde-profundo)] w-full text-white">
    <div className="max-w-7xl mx-auto px-6">
      <h1 className="font-display italic text-5xl md:text-6xl text-white mb-16 text-center animate-in">Encuéntranos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in" style={{ animationDelay: '200ms' }}>
        <div className="bg-[var(--verde-bosque)] p-10 rounded-[32px] border border-[var(--verde-vivo)]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--verde-vivo)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex bg-[var(--verde-brillante)] text-[var(--verde-profundo)] px-4 py-1.5 rounded-[8px] text-xs font-bold font-ui uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--verde-profundo)] mr-2 inline-block animate-pulse"></span> Abierto
            </div>
            <h2 className="font-display font-bold text-4xl mb-4">Salitre Plaza</h2>
            <p className="font-ui text-[var(--verde-palido)] mb-8 text-lg flex items-start gap-3">
              <MapPin className="text-[var(--verde-brillante)] shrink-0 mt-1"/>
              Cra. 68b #24-39, Bogotá<br/>Centro Comercial Salitre Plaza, Local 123
            </p>
            <div className="border-t border-white/10 pt-8 mb-10">
              <h3 className="font-ui font-bold text-[var(--verde-menta)] mb-4">Horarios</h3>
              <ul className="font-ui text-white/70 space-y-3">
                <li className="flex justify-between"><span>Lun — Vie</span> <span className="font-medium text-white">11am — 8pm</span></li>
                <li className="flex justify-between"><span>Sáb — Dom</span> <span className="font-medium text-white">11am — 5pm</span></li>
              </ul>
            </div>
            <Button onClick={() => window.open('https://maps.google.com', '_blank')} className="w-full bg-[var(--verde-vivo)] text-[var(--verde-profundo)] hover:bg-[var(--verde-brillante)] rounded-[16px]">Cómo llegar <Navigation size={16}/></Button>
          </div>
        </div>

        <div className="rounded-[32px] overflow-hidden shadow-2xl h-[500px] border border-white/10 bg-gray-800">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.657317769537!2d-74.1147576241774!3d4.654992995318182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9b8c0c000001%3A0x8037b51b31271ff5!2sSalitre%20Plaza%20Centro%20Comercial!5e0!3m2!1ses!2sco!4v1715012345678!5m2!1ses!2sco"
            width="100%" height="100%" style={{border:0, filter: 'invert(90%) hue-rotate(180deg)'}} allowFullScreen="" loading="lazy">
          </iframe>
        </div>
      </div>
    </div>
  </div>
);

// --- 6. CUENTA ---
const CuentaView = () => (
  <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
    <div className="max-w-2xl mx-auto px-6">
      <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-[var(--verde-palido)] animate-in">
        <div className="flex items-center gap-6 mb-12 border-b border-[var(--verde-palido)] pb-10">
          <div className="w-24 h-24 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center text-[var(--verde-main)] font-display text-4xl font-bold">JN</div>
          <div>
            <h2 className="font-display font-bold text-4xl text-[var(--verde-profundo)] mb-2">Hola, Juan.</h2>
            <div className="inline-flex items-center gap-2 bg-[var(--dorado-suave)]/20 text-[var(--dorado-fuerte)] px-4 py-1.5 rounded-[8px] font-ui font-bold text-sm">
              <Sparkles size={16}/> 240 Puntos Origen
            </div>
          </div>
        </div>

        <div className="bg-[var(--verde-profundo)] rounded-[24px] p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--verde-vivo)] rounded-full blur-[80px] opacity-20"></div>
          <div className="relative z-10">
            <div className="inline-flex bg-[var(--verde-vivo)] text-[var(--verde-profundo)] px-3 py-1 rounded-[8px] text-[10px] font-bold font-ui uppercase tracking-wider mb-4 gap-1 items-center">
              <span>✨</span> Powered by Origen AI
            </div>
            <h3 className="font-display italic text-3xl text-white mb-2">Asesor Nutricional</h3>
            <p className="font-ui text-[var(--verde-palido)] mb-8 font-light text-sm">Dime cuáles son tus metas o antojos y armaré el bowl perfecto para ti al instante.</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Alto en proteína', 'Antojo de algo dulce', 'Sin gluten'].map(t => (
                <span key={t} className="bg-white/10 hover:bg-white/20 cursor-pointer px-3 py-1.5 rounded-[8px] text-xs font-ui border border-white/10 transition-colors">{t}</span>
              ))}
            </div>

            <div className="flex gap-2 bg-white/5 p-2 rounded-[16px] border border-white/10 focus-within:border-[var(--verde-brillante)] transition-colors">
              <input type="text" placeholder="Ej: Quiero algo para post-entreno..." className="flex-1 bg-transparent border-none px-4 font-ui text-sm focus:outline-none text-white placeholder-white/40"/>
              <button className="w-10 h-10 bg-[var(--verde-brillante)] text-[var(--verde-profundo)] rounded-[12px] flex items-center justify-center hover:bg-[var(--verde-vivo)] transition-colors"><ArrowRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================================
   APP PRINCIPAL
   ========================================================================= */

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenOrderModal = (pedido) => setPedidoActivo(pedido);

  const handleConfirmOrder = (modalidad) => {
    if (pedidoActivo) {
      generarMensajeWhatsApp({ ...pedidoActivo, modalidad });
    }
    setPedidoActivo(null);
  };

  const NAV_LINKS = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'menu', label: 'Carta' },
    { id: 'builder', label: 'Arma tu Bowl' },
    { id: 'blog', label: 'Blog' },
    { id: 'ubicaciones', label: 'Ubicaciones' },
  ];

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] selection:bg-[var(--verde-vivo)] selection:text-white flex flex-col">

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root {
          --verde-profundo: #0D2818; --verde-bosque: #1A3D28; --verde-main: #2A6E48;
          --verde-vivo: #3DB87A; --verde-brillante: #4CD98A; --verde-palido: #C8F0DC;
          --verde-menta: #E8F9F0; --dorado-fuerte: #D4A017; --dorado-suave: #F0C040;
          --crema-calido: #FDF5E0; --fondo-crema: #FDFAF4; --texto-oscuro: #0D1F0F;
          --texto-suave: #5A7A60; --kraft: #D4A574; --maximo-amber: #F09030;
        }
        .font-display { font-family: 'Fraunces', serif; }
        .font-ui { font-family: 'Outfit', sans-serif; }
        .font-accent { font-family: 'Instrument Serif', serif; }
        body { margin: 0; padding: 0; background-color: var(--fondo-crema); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .animate-in { opacity: 0; transform: translateY(24px); animation: fadeUp 800ms forwards cubic-bezier(0.23, 1, 0.32, 1); }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || activeTab !== 'inicio' ? 'bg-[#0D1F0F]/95 backdrop-blur-xl border-b border-white/10 py-4 shadow-sm' : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <h1 className="font-display font-bold text-2xl tracking-widest text-white leading-none">ORIGEN</h1>
            <span className="font-ui text-[9px] text-[var(--verde-brillante)] uppercase tracking-[0.2em] mt-1">Comida Saludable</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/10 p-1.5 rounded-[16px] border border-white/10 backdrop-blur-md">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`font-ui text-sm font-semibold px-5 py-2 rounded-[12px] transition-colors ${activeTab === link.id ? 'bg-[var(--verde-brillante)] text-[var(--verde-profundo)]' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('cuenta')} className="text-white/80 hover:text-white transition-colors hidden sm:block"><User size={20}/></button>
            <Button onClick={() => setActiveTab('builder')} variant={scrolled || activeTab !== 'inicio' ? 'primary' : 'ghost'} className="hidden sm:flex rounded-[14px]">Arma tu Bowl</Button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white hover:text-[var(--verde-brillante)] transition-colors"><MenuIcon size={24}/></button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#0A1A12] z-[150] p-6 flex flex-col md:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center pt-4">
              <span className="font-display font-bold text-2xl text-white tracking-widest">ORIGEN</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-10 mt-16 items-center text-center">
              {NAV_LINKS.map(link => (
                <button
                  key={link.id}
                  onClick={() => { setActiveTab(link.id); setIsMobileMenuOpen(false); }}
                  className={`font-display italic text-4xl transition-colors ${activeTab === link.id ? 'text-[var(--verde-brillante)]' : 'text-white hover:text-[var(--verde-palido)]'}`}
                >
                  {link.label}
                </button>
              ))}
              <div className="w-16 h-px bg-white/20 my-4"></div>
              <button
                onClick={() => { setActiveTab('cuenta'); setIsMobileMenuOpen(false); }}
                className="font-ui font-semibold text-xl flex items-center gap-3 text-[var(--verde-menta)] bg-white/10 px-8 py-4 rounded-[16px]"
              >
                <User size={24} /> Mi Cuenta / IA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="relative z-10 flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><HomeView navigate={setActiveTab}/></motion.div>}
          {activeTab === 'menu' && <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CartaView onOrderRequest={handleOpenOrderModal}/></motion.div>}
          {activeTab === 'builder' && <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BuilderView onOrderRequest={handleOpenOrderModal}/></motion.div>}
          {activeTab === 'blog' && <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BlogView navigate={setActiveTab}/></motion.div>}
          {activeTab === 'ubicaciones' && <motion.div key="ubicaciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><UbicacionesView/></motion.div>}
          {activeTab === 'cuenta' && <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CuentaView/></motion.div>}
        </AnimatePresence>
      </main>

      <OrderModal
        pedido={pedidoActivo}
        onClose={() => setPedidoActivo(null)}
        onConfirm={handleConfirmOrder}
      />

      <Footer navigate={setActiveTab} />
    </div>
  );
}
