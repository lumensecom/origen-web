import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Leaf, MapPin, ArrowRight, Instagram, Facebook, User,
  Menu as MenuIcon, X, Sparkles, MessageCircle, Navigation,
  Check, ChevronDown, BookOpen, Store, ShoppingBag,
  Plus, Minus, Trash2, ArrowLeft, Clock, Award
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import SaviaWidget from './components/SaviaWidget';
import { createOrder, addLoyaltyPoints, addPointsHistory } from './lib/database';

const COLORS = {
  verdeProfundo: '#131E14',   // Profundo oliva oscuro
  verdeBosque: '#2F3E2B',     // Oliva bosque cálido
  verdeMain: '#12B362',       // Brand green requested by the user
  verdeVivo: '#1EAD61',
  verdeBrillante: '#4CD98A',
  verdePalido: '#C8F0DC',
  verdeMenta: '#E8F9F0',
  doradoFuerte: '#D4A017',
  doradoSuave: '#F0C040',
  cremaCalido: '#FDF5E0',
  fondoCrema: '#F1F4EA',       // Fondo crema con matiz oliva orgánico muy suave
  textoOscuro: '#0D1F0F',
  kraft: '#D4A574',
  maximoAmber: '#F09030'
};

const HERO_IMAGE = "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635341/9O4A5606_x9ut96.jpg";

const REAL_MEDIA = {
  platoMano: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635341/9O4A5606_x9ut96.jpg",
  local: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635345/9O4A5518_bgwmoe.jpg",
  staff1: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635345/9O4A5682_pxsl4a.jpg",
  staff2: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635346/9O4A5676_v2vrgt.jpg",
  videoTimelapse: "https://res.cloudinary.com/dfj0ckm10/video/upload/q_auto,f_auto,w_800/v1781635367/9O4A5552_njddyy.mp4",
  videoTimelapsePoster: "https://res.cloudinary.com/dfj0ckm10/video/upload/so_0,q_auto,f_auto,w_800/v1781635367/9O4A5552_njddyy.jpg",
  videoClientes: "https://res.cloudinary.com/dfj0ckm10/video/upload/q_auto,f_auto,w_800/v1781635457/9O4A5666_zp1g5p.mp4",
  videoClientesPoster: "https://res.cloudinary.com/dfj0ckm10/video/upload/so_0,q_auto,f_auto,w_800/v1781635457/9O4A5666_zp1g5p.jpg",
  topping1: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635507/9O4A5529_x9bqlf.jpg",
  topping2: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635513/9O4A5532_v6wpek.jpg",
  topping3: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781635513/9O4A5530_urx4gn.jpg",
  pared1: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781633407/9O4A5622_xdlms6.jpg",
  pared2: "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1781633460/9O4A5610_s4xmfb.jpg",
};

const INGREDIENTE_COLORES = {
  'Arroz Blanco': '#F5F0E8', 'Arroz Integral': '#C8A87A', 'Quinoa': '#D4B896', 'Mix Asiático': '#E8D4B0',
  'Zuquini': '#7DC67E', 'Pepino': '#A8D87A', 'Tomate Cherry': '#E8584A', 'Zanahoria': '#F08030', 'Repollo Encurtido': '#C870A8', 'Cebolla Encurtida': '#E0A0C8', 'Berenjena': '#6040A0', 'Brócoli': '#40A040',
  'Maíz': '#FFD040', 'Mango': '#F0A030', 'Manzana': '#E87080', 'Parmesano': '#F0E0A0', 'Aguacate': '#80C060', 'Jalapeños': '#40A040', 'Lenteja Crocante': '#C87820', 'Garbanzos': '#D4A050',
  'Pechuga de Pollo': '#E0A060', 'Huevo Cocido': '#F8D870', 'Tofu': '#F0E8D0', 'Carne': '#8B4020', 'Lomo de Cerdo': '#A05030', 'Máximo (Doble)': '#E0A060',
  'Pesto Natural': '#3DB870', 'Yogurt de Casa': '#F8F8F8', 'Mango Picante': '#F08030', 'Dulce Balance': '#F8D040', 'Vino Mango': '#8040A0'
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
    badge: { texto: 'Plant-Based', color: '#1EAD61', bg: '#E8F5E8' }, 
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
    badge: { texto: 'Favorito', color: '#1EAD61', bg: '#E8F5E8' }, 
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
    badge: { texto: 'Temporada', color: '#1EAD61', bg: '#E8F5E8' }, 
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
    badge: { texto: 'Plant-Based', color: '#1EAD61', bg: '#E8F5E8' }, 
    ingredientes: ['Mix asiático', 'Cherry', 'Zanahoria', 'Aguacate', 'Arándanos', 'Champiñones', 'Huevos', 'Semillas'], 
    tag: 'Vegetariano',
    dietary: ['Gluten-Free', 'Vegetariano']
  },
  {
    id: 'vital',
    nombre: 'ORIGEN VITAL',
    proteina: 'Tofu',
    precio: 22900,
    imagen: null,
    badge: { texto: '100% Plant', color: '#1EAD61', bg: '#E8F5E8' },
    ingredientes: ['Quinua', 'Zuquini', 'Zanahoria', 'Repollo', 'Mango', 'Champiñones', 'Tofu', 'Semillas'],
    tag: 'Vegetariano',
    dietary: ['Vegetariano', 'Gluten-Free']
  },
];

const BEBIDAS = [
  { id: 'limonada-natural', nombre: 'Limonada Natural', precio: 5900, desc: 'Limonada fresca preparada al instante con limón real.', emoji: '🍋' },
  { id: 'jugo-agua', nombre: 'Jugo Natural en Agua', precio: 5900, desc: 'Jugos naturales del día preparados con agua fresca.', emoji: '🧃' },
  { id: 'jugo-leche', nombre: 'Jugo Natural en Leche', precio: 6900, desc: 'Jugos naturales del día preparados con leche entera.', emoji: '🥛' },
  { id: 'agua-mineral', nombre: 'Agua Mineral', precio: 5900, desc: 'Agua mineral natural sin gas, pura y refrescante.', emoji: '💧' },
  { id: 'agua-gas', nombre: 'Agua con Gas', precio: 5900, desc: 'Agua mineral con gas natural, ligera y refrescante.', emoji: '💦' },
  { id: 'te-hatsu', nombre: 'Té Hatsu', precio: 7900, desc: 'Té natural Hatsu artesanal en diferentes sabores.', emoji: '🍵' },
  { id: 'soda-hatsu', nombre: 'Soda Hatsu', precio: 6900, desc: 'Soda refrescante Hatsu, burbujas naturales de caña.', emoji: '🥤' },
];

const LOCALES = [
  {
    id: 'salitre',
    nombre: 'CC Salitre Plaza',
    direccion: 'Calle 24a # 69-76, Local 372 — Bogotá',
    detalles: 'Dentro de Salitre Plaza, en plena zona empresarial. Perfecto para un almuerzo rápido y cargado de energía real.',
    horarioSemana: '11:30 AM – 8:00 PM',
    horarioFinde: '11:30 AM – 8:00 PM',
    amenidades: ['Pet Friendly', 'Wi-Fi gratis', 'Zona de terraza'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.6713600984107!2d-74.11326462417742!3d4.652613195321855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9be4a9efdf87%3A0x6b9ef2df3f486851!2sAv.%20El%20Dorado%20%2369%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012345678!5m2!1ses!2sco'
  },
  {
    id: 'chile',
    nombre: 'Av. Chile — Local 408B',
    direccion: 'Calle 72 # 10-34, Local 408B — Bogotá',
    detalles: 'En el epicentro financiero de Bogotá. La pausa perfecta y nutritiva para tu jornada laboral diaria.',
    horarioSemana: '11:30 AM – 7:00 PM',
    horarioFinde: '11:30 AM – 6:00 PM',
    amenidades: ['Para llevar', 'Estación de carga', 'Opciones Veganas'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.54347712391!2d-74.05923162417724!3d4.657538995316499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a5be41bb59b%3A0xe744e8ec50672e!2sCl.%2072%20%2310-34%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012355678!5m2!1ses!2sco'
  },
  {
    id: 'nuestro-bogota',
    nombre: 'CC Nuestro Bogotá',
    direccion: 'Av. Ciudad de Cali # 52-25, Local L3-127 — Bogotá',
    detalles: 'Ubicados en el Centro Comercial Nuestro Bogotá. El spot ideal para alimentarte sanamente.',
    horarioSemana: '11:00 AM – 9:00 PM',
    horarioFinde: '11:00 AM – 9:00 PM',
    amenidades: ['Zona infantil', 'Parqueadero cubierto', 'Pagos digitales'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.55621376841!2d-74.12431762417726!3d4.655255995318042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9b008d5dfd35%3A0x67db23315a6e8b2b!2sCC%20Nuestro%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012365678!5m2!1ses!2sco'
  }
];

const formatPrice = (price) => `$${price.toLocaleString('es-CO')}`;
const MAX_CHAT_HISTORY = 8; // mensajes recientes que se envían como contexto a Savia

// Variantes de animación reutilizables para revelar secciones al hacer scroll
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Contador animado: cuenta desde 0 hasta `to` cuando entra en pantalla
const StatCounter = ({ to, suffix = '', prefix = '', duration = 1200 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
};

// Hoja decorativa flotante — detalle visual sutil, no interactivo
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

// Video que solo carga/reproduce cuando entra a la pantalla, y respeta el modo
// de ahorro de datos del usuario mostrando solo el poster en ese caso.
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

const Button = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
  const base = "px-8 py-3.5 rounded-[16px] font-ui font-bold tracking-wider text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
    ghost: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5",
    outline: "border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] hover:bg-[var(--verde-profundo)] hover:text-white"
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const CheckoutModal = ({ cart, onUpdateQty, onRemoveItem, onClose, onConfirmOrder }) => {
  const [step, setStep] = useState('cart'); // cart -> deliveryType -> pickupStore -> deliveryAddress
  const [selectedStore, setSelectedStore] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
  }, [cart]);

  const goBack = () => {
    if (step === 'deliveryType') setStep('cart');
    else if (step === 'pickupStore' || step === 'deliveryAddress') setStep('deliveryType');
  };

  const stepLabel = { cart: 'Tu Pedido', deliveryType: '¿Cómo lo recibas?', pickupStore: 'Elige tu sede', deliveryAddress: '¿A dónde lo llevamos?' };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-sm p-8 rounded-[28px] text-center shadow-2xl">
          <span className="text-5xl block mb-4">🥣</span>
          <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-2">Aún no hay nada aquí</h3>
          <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">Explora nuestra carta y agrega tu bowl favorito.</p>
          <button onClick={onClose} className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all">Ver Carta</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step !== 'cart' && (
              <button onClick={goBack} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                <ArrowLeft size={16} className="text-gray-600" />
              </button>
            )}
            <h2 className="font-display italic text-xl text-[var(--verde-profundo)]">{stepLabel[step]}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">

            {/* PASO 1 — Items del carrito */}
            {step === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 bg-[var(--fondo-crema)] rounded-[18px]">
                    <div className="w-12 h-12 rounded-[12px] overflow-hidden bg-[var(--verde-menta)] flex items-center justify-center text-xl flex-shrink-0">
                      {item.imagen ? <img loading="lazy" src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" /> : (item.emoji || '🥣')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)] truncate">{item.nombre}</p>
                      {item.esBuilder && <p className="font-ui text-[10px] text-[var(--texto-suave)] truncate">{item.base} · {item.proteina}</p>}
                      <p className="font-ui text-sm font-bold text-[var(--verde-main)]">{formatPrice(item.precio * item.quantity)}</p>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1">
                      <button onClick={() => onUpdateQty(item, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors active:scale-90">
                        <Minus size={12} />
                      </button>
                      <span className="font-ui text-sm font-bold w-4 text-center text-[var(--verde-profundo)]">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[var(--verde-main)] transition-colors active:scale-90">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => onRemoveItem(item)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors active:scale-90">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* PASO 2 — Tipo de entrega */}
            {step === 'deliveryType' && (
              <motion.div key="delivery" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                <button onClick={() => setStep('pickupStore')} className="w-full flex items-center gap-4 p-5 bg-[var(--fondo-crema)] rounded-[20px] hover:bg-[var(--verde-menta)] group transition-all text-left border-2 border-transparent hover:border-[var(--verde-main)]">
                  <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center text-[var(--verde-main)] shadow-sm group-hover:scale-110 transition-transform">
                    <Store size={22} />
                  </div>
                  <div>
                    <p className="font-ui font-bold text-base text-[var(--verde-profundo)]">Recoger en local</p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">Listo en minutos — pasa y recoge tu bowl</p>
                  </div>
                  <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => setStep('deliveryAddress')} className="w-full flex items-center gap-4 p-5 bg-[var(--fondo-crema)] rounded-[20px] hover:bg-[var(--verde-menta)] group transition-all text-left border-2 border-transparent hover:border-[var(--verde-main)]">
                  <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center text-[var(--verde-main)] shadow-sm group-hover:scale-110 transition-transform">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="font-ui font-bold text-base text-[var(--verde-profundo)]">Pedir a domicilio</p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">Te lo llevamos directo a tu puerta</p>
                  </div>
                  <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>
            )}

            {/* PASO 3 — Seleccionar sede */}
            {step === 'pickupStore' && (
              <motion.div key="pickup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                {LOCALES.map(store => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[18px] border-2 text-left transition-all ${
                      selectedStore?.id === store.id
                        ? 'border-[var(--verde-main)] bg-[var(--verde-menta)]'
                        : 'border-gray-100 bg-[var(--fondo-crema)] hover:border-[var(--verde-palido)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedStore?.id === store.id ? 'border-[var(--verde-main)]' : 'border-gray-300'}`}>
                      {selectedStore?.id === store.id && <div className="w-2.5 h-2.5 bg-[var(--verde-main)] rounded-full" />}
                    </div>
                    <div>
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">{store.nombre}</p>
                      <p className="font-ui text-xs text-[var(--texto-suave)]">{store.direccion}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* PASO 4 — Domicilio */}
            {step === 'deliveryAddress' && (
              <motion.div key="address" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Dirección en Bogotá</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej: Calle 26 # 68-10, Apto 402"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Indicaciones adicionales</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ej: Barrio Chapinero, frente al parque"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer — total + CTA */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-ui text-sm text-[var(--texto-suave)]">Total del pedido</span>
            <span className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{formatPrice(cartTotal)}</span>
          </div>

          {step === 'cart' && (
            <button onClick={() => setStep('deliveryType')} className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] flex items-center justify-center gap-2">
              Continuar al pedido <ArrowRight size={18} />
            </button>
          )}
          {step === 'pickupStore' && (
            <button
              onClick={() => onConfirmOrder({ modalidad: 'Recoger en Local', store: selectedStore })}
              disabled={!selectedStore}
              className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Confirmar por WhatsApp <ArrowRight size={18} />
            </button>
          )}
          {step === 'deliveryAddress' && (
            <button
              onClick={() => onConfirmOrder({ modalidad: 'Domicilio', direccion: address, detalles: phone })}
              disabled={!address.trim()}
              className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Confirmar por WhatsApp <ArrowRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Footer = ({ navigate }) => {
  const handleNav = (id) => {
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050505] pt-20 pb-12 border-t border-white/5 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <h2 className="font-logo text-3xl tracking-wide mb-4">ORIGEN</h2>
          <p className="font-ui text-white/50 text-sm mb-6 max-w-sm">Comida saludable, rápida y de verdad. Preparada al instante para nutrir tu cuerpo sin aburrir tu paladar.</p>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors"><Instagram size={18}/></button>
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors"><Facebook size={18}/></button>
          </div>
        </div>
        
        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Explorar</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('menu')} className="hover:text-[var(--verde-main)] transition-colors">Carta Origen</button></li>
            <li><button onClick={() => handleNav('builder')} className="hover:text-[var(--verde-main)] transition-colors">Arma tu Bowl</button></li>
            <li><button onClick={() => handleNav('blog')} className="hover:text-[var(--verde-main)] transition-colors">Historias / Blog</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Visítanos</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-main)] transition-colors">Locales Bogotá</button></li>
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-main)] transition-colors">Horarios de Atención</button></li>
            <li><button onClick={() => handleNav('cuenta')} className="hover:text-[var(--verde-main)] transition-colors">Mi Cuenta / Puntos</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">¿Dudas o Antojos?</h4>
          <p className="font-ui text-sm text-white/50 mb-4">Pregúntale a nuestro equipo directamente por WhatsApp.</p>
          <button 
            onClick={() => window.open('https://wa.me/573103112799', '_blank')} 
            className="w-full bg-white text-black hover:bg-[var(--verde-main)] rounded-[16px] px-6 py-3 font-ui font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
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

const BRAND_PHRASES = [
  "Tu cuerpo es lo que comes — elígete bien.",
  "Cada bowl es un paso hacia tu mejor versión.",
  "Nutrir tu cuerpo no debería ser complicado.",
  "Hecho con ingredientes reales, para personas reales.",
  "La salud empieza en lo que pones en tu plato.",
  "Fresco. Rápido. Sin compromisos.",
  "Mereces comer bien aunque tengas prisa.",
  "El mejor momento para empezar es hoy.",
];

const FEELINGS = [
  { key: 'energy', emoji: '⚡', label: 'Sin energía', bowlId: 'brasa', msg: 'Proteína y energía real para tu día.' },
  { key: 'active', emoji: '💪', label: 'Activo', bowlId: 'tierra', msg: 'Proteína premium para tu rendimiento.' },
  { key: 'light', emoji: '🌿', label: 'Liviano', bowlId: 'natural', msg: 'Fresco, suave y sin culpa.' },
  { key: 'craving', emoji: '🔥', label: 'Antojado', bowlId: 'fuego', msg: 'Sabor intenso con camarón fresco.' },
  { key: 'fast', emoji: '🏃', label: 'Con prisa', bowlId: 'dulce', msg: 'Rápido, rico y sin complicaciones.' },
  { key: 'brain', emoji: '🧠', label: 'Enfocado', bowlId: 'raiz', msg: 'Omega-3 y nutrientes para tu mente.' },
];

const HomeView = ({ navigate }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [feeling, setFeeling] = useState(null);
  const selectedBowl = useMemo(() => feeling ? CARTA.find(b => b.id === feeling.bowlId) : null, [feeling]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % BRAND_PHRASES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative bg-[var(--fondo-crema)] pb-32">
      
      {/* Hero Inmersivo */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-[#050505]">
        <motion.div style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.15]) }} className="absolute inset-0 z-0">
          <img loading="eager" fetchPriority="high" src={HERO_IMAGE} alt="Origen Bowl" className="w-full h-full object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,40,24,0.4)] to-[rgba(5,25,12,0.9)]"></div>
        </motion.div>

        <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="font-display font-bold text-5xl md:text-8xl text-white leading-[1.05] mb-6 drop-shadow-2xl"
          >
            Nutrición desde<br/>el origen.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="font-ui text-lg md:text-xl text-[var(--verde-menta)] font-light drop-shadow-md max-w-lg mx-auto"
          >
            Recetas pensadas para alimentar tu cuerpo con la velocidad que necesitas y el sabor que mereces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Button onClick={() => navigate('menu')} variant="primary" className="bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)]">
              Ver Carta <ArrowRight size={16} />
            </Button>
            <Button onClick={() => navigate('builder')} variant="ghost" className="hover:bg-white hover:text-[var(--verde-profundo)]">
              Armar Mi Bowl <Sparkles size={16} />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Widget "¿Cómo te sientes hoy?" */}
      <div className="max-w-5xl mx-auto px-4 relative z-30 -mt-10">
        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-[#E8F0E8] p-5 md:p-7">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5 }}
              className="font-display italic text-base md:text-lg text-[var(--verde-profundo)] text-center mb-3 min-h-[1.75rem]"
            >
              {BRAND_PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
          <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[var(--texto-suave)] mb-4 text-center">¿Cómo te sientes hoy?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {FEELINGS.map(f => (
              <button
                key={f.key}
                onClick={() => setFeeling(feeling?.key === f.key ? null : f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-ui text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  feeling?.key === f.key
                    ? 'bg-[var(--verde-main)] text-white shadow-lg scale-105'
                    : 'bg-[var(--fondo-crema)] text-[var(--verde-profundo)] hover:bg-[var(--verde-menta)] hover:scale-105'
                }`}
              >
                <span className="text-base">{f.emoji}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {feeling && selectedBowl && (
              <motion.div
                key={feeling.key}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
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
                  <button
                    onClick={() => navigate('menu')}
                    className="bg-[var(--verde-main)] text-white font-ui font-bold text-sm px-6 py-3 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    Ver en Carta <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={staggerContainer}
        className="w-full flex flex-col md:flex-row bg-[var(--fondo-crema)] relative z-20 max-w-7xl mx-auto px-6 py-12 gap-6"
      >
        <motion.div variants={fadeUp} onClick={() => navigate('builder')} className="relative flex-1 bg-[var(--verde-profundo)] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-bosque)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--verde-main)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-white mb-4 transition-transform duration-500 group-hover:-translate-y-1">Crea tu<br/><span className="text-[var(--amarillo-vivo)]">Origen</span></h2>
            <p className="font-ui text-[var(--verde-palido)] max-w-xs text-base">Diseña tu obra maestra paso a paso con nuestros ingredientes frescos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--amarillo-vivo)] text-[var(--verde-profundo)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <Sparkles size={24} />
          </div>
        </motion.div>
        <motion.div variants={fadeUp} onClick={() => navigate('menu')} className="relative flex-1 bg-[#E8EFE3] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-palido)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mb-4 transition-transform duration-500 group-hover:-translate-y-1">Carta<br/><span className="text-[var(--verde-main)]">Origen</span></h2>
            <p className="font-ui text-[var(--texto-suave)] max-w-xs text-base">Explora nuestras 11 combinaciones perfectas diseñadas por expertos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--verde-profundo)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
            <ArrowRight size={24} />
          </div>
        </motion.div>
      </motion.div>

      {/* Barra de stats de marca — refuerza confianza con energía visual */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 py-10 relative z-20"
      >
        {[
          { to: 11, suffix: '', label: 'Bowls en la carta' },
          { to: 100, suffix: '%', label: 'Preparado al momento' },
          { to: 3, suffix: '', label: 'Locales en Bogotá' },
          { to: 50, suffix: ' pts', label: 'Por cada compra' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={fadeUp} className="text-center">
            <p className="font-display font-bold text-3xl md:text-4xl text-[var(--verde-main)] mb-1">
              <StatCounter to={stat.to} suffix={stat.suffix} />
            </p>
            <p className="font-ui text-[11px] md:text-xs uppercase tracking-wider text-[var(--texto-suave)] font-semibold">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Sección Editorial con Galería de Fotos Reales */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center bg-[var(--fondo-crema)] relative z-20 overflow-hidden">
        <FloatingLeaf className="top-4 right-[8%] hidden lg:block" size={32} delay={0.4} />
        <FloatingLeaf className="bottom-10 left-[4%] hidden lg:block" size={22} delay={1.2} color="var(--amarillo-suave)" />

        {/* Galería Interactiva con las fotos reales de Cloudinary */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-4 order-2 lg:order-1"
        >
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
          className="flex flex-col justify-center order-1 lg:order-2"
        >
           <motion.span variants={fadeUp} className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-6 flex items-center gap-2">
             <span className="w-6 h-px bg-[var(--verde-main)]"></span> Nuestra Esencia
           </motion.span>
           <motion.h2 variants={fadeUp} className="font-display italic text-5xl md:text-6xl text-[var(--verde-profundo)] mb-8 leading-tight">
             Comer bien<br/>nunca fue<br/>tan fácil.
           </motion.h2>
           <motion.p variants={fadeUp} className="font-ui text-lg text-[var(--texto-suave)] leading-relaxed mb-10 max-w-lg">
             Creemos que la comida saludable debe ser deliciosa, rápida y accesible. Trabajamos de la mano con agricultores locales para traer los ingredientes más frescos a tu bowl, todos los días. Preparado frente a ti, a tu ritmo.
           </motion.p>
           <motion.button variants={fadeUp} onClick={() => {navigate('blog'); window.scrollTo(0,0);}} className="w-max border-b-2 border-[var(--verde-main)] text-[var(--verde-profundo)] font-ui font-bold text-lg pb-1 hover:text-[var(--verde-main)] transition-colors flex items-center gap-2 group">
             Descubre nuestras historias <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </motion.button>
        </motion.div>
      </div>

      {/* Así es Origen — fotos y videos reales del local, equipo y proceso */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} className="text-center mb-12">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Así es Origen</span>
          <h2 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)]">Real, fresco y hecho<br className="hidden md:block"/> frente a ti.</h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Video: timelapse de preparación */}
          <motion.div variants={fadeUp} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] group bg-[var(--verde-profundo)]">
            <LazyVideo src={REAL_MEDIA.videoTimelapse} poster={REAL_MEDIA.videoTimelapsePoster} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Tu bowl, armado al instante.</p>
          </motion.div>
          {/* Foto: local */}
          <motion.div variants={fadeUp} onClick={() => navigate('ubicaciones')} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] cursor-pointer group">
            <img loading="lazy" src={REAL_MEDIA.local} alt="Local Origen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Nuestro espacio te espera.</p>
            <span className="absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--verde-profundo)]">Ver ubicaciones</span>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video: clientes disfrutando frente al local */}
          <motion.div variants={fadeUp} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] group bg-[var(--verde-profundo)]">
            <LazyVideo src={REAL_MEDIA.videoClientes} poster={REAL_MEDIA.videoClientesPoster} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">Vive la experiencia Origen.</p>
          </motion.div>
          {/* Foto: equipo -> blog */}
          <motion.div variants={fadeUp} onClick={() => {navigate('blog'); window.scrollTo(0,0);}} className="relative rounded-[24px] overflow-hidden shadow-md aspect-[4/3] cursor-pointer group">
            <img loading="lazy" src={REAL_MEDIA.staff1} alt="Equipo Origen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display italic text-xl md:text-2xl text-white drop-shadow-md">El equipo detrás de cada bowl.</p>
            <span className="absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--verde-profundo)]">Leer historia</span>
          </motion.div>
        </motion.div>

        {/* Ingredientes frescos */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} className="text-center mt-16 mb-8">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Ingredientes Frescos</span>
          <h3 className="font-display italic text-2xl md:text-3xl text-[var(--verde-profundo)]">Lo que ves es lo que comes.</h3>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="grid grid-cols-3 gap-4">
          <motion.div variants={fadeUp} className="rounded-[20px] overflow-hidden shadow-sm aspect-square">
            <img loading="lazy" src={REAL_MEDIA.topping1} alt="Ingredientes frescos" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-[20px] overflow-hidden shadow-sm aspect-square">
            <img loading="lazy" src={REAL_MEDIA.topping2} alt="Ingredientes frescos" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-[20px] overflow-hidden shadow-sm aspect-square">
            <img loading="lazy" src={REAL_MEDIA.topping3} alt="Ingredientes frescos" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const CartaCard = ({ item, onAddToCart, isBebida }) => {
  const [doble, setDoble] = useState(false);
  const precioFinal = doble ? item.precio + 6000 : item.precio;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(doble ? { ...item, nombre: item.nombre + ' — Doble Proteína', precio: precioFinal } : item);
    setDoble(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8F0E8] hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col relative group ${item.esMaximo ? 'border-[var(--maximo-amber)] ring-1 ring-[var(--maximo-amber)]/20' : ''}`}
    >
      <div className="absolute top-6 left-6 z-20">
        <span
          className="px-3 py-1.5 rounded-[12px] text-[10px] font-ui font-bold uppercase tracking-wide"
          style={{ backgroundColor: isBebida ? '#E8F9F0' : item.badge?.bg, color: isBebida ? 'var(--verde-main)' : item.badge?.color }}
        >
          {isBebida ? 'Refrescante' : item.badge?.texto}
        </span>
      </div>

      <div className="w-[180px] h-[180px] mx-auto rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] bg-[#FDFCF8] flex items-center justify-center overflow-hidden mb-5 relative z-10">
        {isBebida ? (
          <span className="text-8xl select-none group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
        ) : item.imagen ? (
          <img loading="lazy" src={item.imagen} alt={item.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <div className="w-full h-full bg-[#E8F5E8] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">🥗</div>
        )}
      </div>

      <div className="flex-grow flex flex-col items-center">
        <h3 className="font-display font-bold text-[22px] text-[#1A1A1A] leading-[1.2] text-center mb-3">{item.nombre}</h3>
        {isBebida ? (
          <p className="font-ui text-sm text-[var(--texto-suave)] text-center max-w-[240px]">{item.desc}</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {item.ingredientes?.map((ing, i) => (
              <span key={i} className="bg-[#F5F5F5] text-[#2D3A2D] text-[10px] font-medium px-2.5 py-1 rounded-[6px]">{ing}</span>
            ))}
          </div>
        )}
        {!isBebida && item.dietary && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-auto pt-2">
            {item.dietary.map((tag, i) => (
              <span key={i} className="bg-[#E8F5E8] text-[var(--verde-main)] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px]">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center w-full gap-2.5">
        {!isBebida && (
          <button
            onClick={(e) => { e.stopPropagation(); setDoble(d => !d); }}
            className={`w-full py-2 rounded-[12px] font-ui text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${doble ? 'bg-[var(--maximo-amber)] text-white' : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E8F5E8] hover:text-[var(--verde-main)]'}`}
          >
            ⚡ Doble Proteína {doble ? '— Activada' : '+$6.000'}
          </button>
        )}
        <div className="font-display font-bold text-[26px] text-[var(--verde-main)]">{formatPrice(precioFinal)}</div>
        <button
          onClick={handleAdd}
          className="w-full rounded-[24px] border-2 border-[#1A1A1A] text-[#1A1A1A] bg-white text-[13px] font-bold uppercase tracking-wide py-3 hover:bg-[var(--verde-main)] hover:border-[var(--verde-main)] hover:text-white transition-all duration-300 hover:shadow-[0_8px_20px_rgba(18,179,98,0.25)] flex justify-center items-center gap-2"
        >
          Añadir al pedido <ShoppingBag size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const VIRALES_IDS = ['tierra', 'fuego', 'cosecha', 'dulce', 'raiz'];

const CartaView = ({ onAddToCart }) => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const categorias = ['Todos', 'Mariscos', 'Proteína Animal', 'Vegetariano', 'Especiales', 'Bebidas'];

  const virales = useMemo(() => CARTA.filter(b => VIRALES_IDS.includes(b.id)), []);

  const bowlsFiltrados = useMemo(() => {
    if (filtroActivo === 'Bebidas') return BEBIDAS;
    return CARTA.filter(bowl => {
      if (filtroActivo === 'Todos') return true;
      if (filtroActivo === 'Especiales') return bowl.badge?.texto === 'Premium';
      return bowl.tag === filtroActivo;
    });
  }, [filtroActivo]);

  return (
    <div className="pt-32 pb-32 bg-[#FAFAFA] w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="text-center mb-16 animate-in">
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Carta Origen</h1>
          <p className="font-ui text-lg text-[#2D5A4A]">11 combinaciones perfectas y bebidas frescas de la casa.</p>
        </div>

        {/* Carrusel Virales de la Semana */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-base">🔥</span>
            <h2 className="font-ui font-bold text-xs uppercase tracking-[0.2em] text-[var(--verde-profundo)]">Platos Virales de la Semana</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-6 px-6">
            {virales.map((bowl) => (
              <div
                key={bowl.id}
                onClick={() => onAddToCart(bowl)}
                className="flex-shrink-0 w-40 bg-white rounded-[18px] border border-[#E8F0E8] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className="h-24 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                  {bowl.imagen
                    ? <img loading="lazy" src={bowl.imagen} alt={bowl.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <span className="text-4xl">🥗</span>}
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-[11px] text-[#1A1A1A] leading-tight mb-1">{bowl.nombre}</p>
                  <p className="font-ui text-[10px] text-[var(--texto-suave)] mb-1.5">{bowl.proteina}</p>
                  <p className="font-display font-bold text-sm text-[var(--verde-main)]">{formatPrice(bowl.precio)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-hide animate-in justify-start md:justify-center" style={{ scrollbarWidth: 'none' }}>
          {categorias.map((t, i) => (
            <button
              key={i}
              onClick={() => setFiltroActivo(t)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-[12px] font-ui text-sm font-semibold transition-all duration-300 ${filtroActivo === t ? 'bg-[var(--verde-main)] text-white shadow-md' : 'bg-white border border-[#E8F0E8] text-[#2D3A2D] hover:bg-[#F5F5F5]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {bowlsFiltrados.map((item) => {
              const isBebida = filtroActivo === 'Bebidas' || !item.tag;
              return <CartaCard key={item.id} item={item} onAddToCart={onAddToCart} isBebida={isBebida} />;
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

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
             {selections.proteina.includes('Doble') && (
               <path d="M60,100 Q100,50 140,100 Q100,140 60,100 Z" fill={INGREDIENTE_COLORES[selections.proteina] || '#E0A060'} opacity="0.8" transform="translate(0, 15) scale(0.9)" />
             )}
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

const BuilderView = ({ onAddToCart }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ base: '', frescuras: [], sabores: [], proteina: '', salsa: '' });
  
  // Nuevo estado para controlar si es Porción Sencilla o Porción Máxima (Doble) de Proteínas
  const [proteinMode, setProteinMode] = useState('sencilla'); // 'sencilla' o 'doble'
  const [selectedProteins, setSelectedProteins] = useState([]); // Arreglo para acumular hasta 2 proteínas

  // Estado para el upsell de bebidas dentro del propio armador
  const [addedDrinks, setAddedDrinks] = useState([]);

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

  // Lógica de proteínas especializadas para Origen Máximo
  const handleProteinSelect = (prot) => {
    if (proteinMode === 'sencilla') {
      setSelectedProteins([prot]);
      setSelections(prev => ({ ...prev, proteina: prot }));
    } else {
      setSelectedProteins(prev => {
        let next;
        if (prev.includes(prot)) {
          next = prev.filter(p => p !== prot);
        } else {
          if (prev.length < 2) {
            next = [...prev, prot];
          } else {
            next = prev;
          }
        }
        // Construir string descriptivo para guardar
        const formatted = next.length === 2 
          ? `Máximo (${next[0]} + ${next[1]})` 
          : next.length === 1 ? `Doble ${next[0]}` : '';
        setSelections(current => ({ ...current, proteina: formatted }));
        return next;
      });
    }
  };

  const toggleAddedDrink = (drink) => {
    setAddedDrinks(prev => {
      if (prev.find(d => d.id === drink.id)) {
        return prev.filter(d => d.id !== drink.id);
      } else {
        return [...prev, drink];
      }
    });
  };

  const isMaximo = proteinMode === 'doble';
  const basePrice = 24900;
  const proteinSurcharge = isMaximo ? 6000 : 0;
  const drinksTotal = addedDrinks.reduce((acc, d) => acc + d.precio, 0);
  const totalPrice = basePrice + proteinSurcharge + drinksTotal;

  const OPTIONS = {
    1: { id: 'base', max: 1, icon: '🌾', title: '¿Cuál es tu base?', sub: 'La fundación de tu bowl', items: ['Arroz Blanco', 'Arroz Integral', 'Quinoa', 'Mix Asiático'] },
    2: { id: 'frescuras', max: 2, icon: '🥦', title: 'Tus frescuras', sub: 'Elige hasta 2 — frescas y crujientes', items: ['Zuquini', 'Pepino', 'Tomate Cherry', 'Zanahoria', 'Repollo Encurtido', 'Cebolla Encurtida', 'Berenjena', 'Brócoli'] },
    3: { id: 'sabores', max: 2, icon: '✨', title: 'Sabores especiales', sub: 'Lo que hace único a tu bowl — elige hasta 2', items: ['Maíz', 'Mango', 'Manzana', 'Parmesano', 'Aguacate', 'Jalapeños', 'Lenteja Crocante', 'Garbanzos'] },
    4: { id: 'proteina', max: 1, icon: '⚡', title: 'Tu proteína', sub: 'El corazón de tu bowl', items: ['Pechuga de Pollo', 'Huevo Cocido', 'Tofu', 'Carne', 'Lomo de Cerdo'] },
    5: { id: 'salsa', max: 1, icon: '💚', title: 'El toque final', sub: 'La salsa que lo une todo', items: ['Pesto Natural', 'Yogurt de Casa', 'Mango Picante', 'Dulce Balance', 'Vino Mango'] }
  };

  const curr = OPTIONS[step];

  const isStepCompleted = useMemo(() => {
    if (step === 6) return true; // Paso opcional de bebidas
    if (!curr) return false;
    if (curr.id === 'proteina') {
      return selectedProteins.length > 0;
    }
    const currentSelection = selections[curr.id];
    if (Array.isArray(currentSelection)) {
      return currentSelection.length > 0;
    }
    return currentSelection !== '';
  }, [selections, curr, step, selectedProteins]);

  const handleFinishCustomBowl = () => {
    // Agregar el bowl personalizado al pedido principal
    onAddToCart({ 
      id: `custom-${Date.now()}`,
      nombre: isMaximo ? 'BOWL MÁXIMO PERSONALIZADO' : 'BOWL PERSONALIZADO', 
      precio: basePrice + proteinSurcharge, 
      esBuilder: true, 
      ...selections 
    });

    // Agregar de forma automática las bebidas elegidas en el upsell del builder
    addedDrinks.forEach(drink => {
      onAddToCart(drink);
    });

    // Reiniciar estados del builder
    setStep(1);
    setSelections({ base: '', frescuras: [], sabores: [], proteina: '', salsa: '' });
    setSelectedProteins([]);
    setAddedDrinks([]);
  };

  return (
    <div className="bg-[var(--fondo-crema)] w-full flex flex-col lg:flex-row">
      {/* LEFT PANEL — viewport height, content scrolls internally, nav always visible */}
      <div className="w-full lg:w-1/2 bg-[var(--verde-profundo)] text-white flex flex-col h-[100svh] sticky top-0 z-20 overflow-hidden">

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-24 pb-4 lg:px-12 lg:pt-12">
          <div className="mb-8">
            <h1 className="font-display italic text-4xl md:text-5xl text-white mb-2">Crea tu <span className="text-[var(--amarillo-vivo)]">Origen</span></h1>
            <p className="font-ui text-[var(--verde-palido)] opacity-80">Diseño intuitivo para crear tu bowl perfecto.</p>
          </div>

          {/* Indicador de Precio en Vivo Móvil */}
          <div className="lg:hidden bg-[var(--verde-bosque)]/95 backdrop-blur-md p-4 rounded-[16px] mb-8 flex justify-between items-center border border-[var(--verde-main)]/20 shadow-lg">
            <span className="font-ui text-sm text-[var(--verde-palido)]">Total Combo:</span>
            <motion.span key={totalPrice} className={`font-display font-bold text-2xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-white'}`}>{formatPrice(totalPrice)}</motion.span>
          </div>

          {step <= 5 && (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{curr?.icon}</span>
                <div>
                  <h2 className="font-ui font-bold text-2xl">{curr?.title}</h2>
                  <p className="font-accent text-lg text-[var(--verde-palido)]">{curr?.sub}</p>
                </div>
              </div>

              {/* LÓGICA ESPECIAL PARA EL PASO 4 (PROTEÍNA) */}
              {curr?.id === 'proteina' ? (
                <div className="space-y-6">
                  {/* Tabs selectores de modalidad de proteína */}
                  <div className="grid grid-cols-2 gap-2 bg-[var(--verde-bosque)] p-1 rounded-[14px]">
                    <button 
                      onClick={() => { setProteinMode('sencilla'); setSelectedProteins([]); setSelections(p => ({ ...p, proteina: '' })); }}
                      className={`py-3 rounded-[10px] font-ui text-xs font-bold uppercase transition-all ${proteinMode === 'sencilla' ? 'bg-[var(--verde-main)] text-white' : 'text-[var(--verde-palido)] hover:text-white'}`}
                    >
                      Sencilla
                    </button>
                    <button 
                      onClick={() => { setProteinMode('doble'); setSelectedProteins([]); setSelections(p => ({ ...p, proteina: '' })); }}
                      className={`py-3 rounded-[10px] font-ui text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${proteinMode === 'doble' ? 'bg-[var(--maximo-amber)] text-[var(--verde-profundo)] font-extrabold' : 'text-[var(--verde-palido)] hover:text-white'}`}
                    >
                      ⚡ Máxima (Doble) (+ $6.000)
                    </button>
                  </div>

                  <p className="font-ui text-xs text-[var(--verde-palido)] italic">
                    {proteinMode === 'sencilla' 
                      ? "Selecciona tu proteína favorita para una porción clásica." 
                      : "¡Arma tu Origen Máximo! Elige hasta 2 proteínas diferentes (o selecciona solo una para recibir porción doble de la misma)."}
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {curr?.items.map(item => {
                      const isSelected = selectedProteins.includes(item);
                      const isLimitReached = proteinMode === 'sencilla' ? selectedProteins.length >= 1 : selectedProteins.length >= 2;
                      const isDisabled = isLimitReached && !isSelected;

                      return (
                        <button 
                          key={item}
                          onClick={() => handleProteinSelect(item)}
                          disabled={isDisabled}
                          className={`text-left p-4 rounded-[16px] transition-all duration-300 font-ui border-2 flex items-center justify-between ${
                            isSelected 
                              ? (proteinMode === 'doble' ? 'bg-[var(--maximo-amber)] text-[var(--verde-profundo)] border-[var(--maximo-amber)]' : 'bg-[var(--verde-main)] text-white border-[var(--verde-main)]')
                              : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-palido)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]'
                          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div>
                            <span className="font-bold text-lg block">{item}</span>
                            {isSelected && proteinMode === 'doble' && (
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Sugerida en combo Máximo</span>
                            )}
                          </div>
                          <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-current' : 'border-current opacity-30'}`}>
                            {isSelected && <Check size={14} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* RENDERIZADO GENERAL DE LOS DEMÁS PASOS */
                <div className="space-y-4">
                  {/* Hint de doble porción para frescuras y sabores */}
                  {curr?.max === 2 && Array.isArray(selections[curr.id]) && selections[curr.id].length === 1 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-[var(--verde-main)]/20 border border-[var(--verde-main)]/30 px-3 py-2 rounded-[10px]">
                      <span className="text-sm">✌️</span>
                      <p className="font-ui text-xs text-[var(--verde-palido)]">Solo elegiste 1 — recibirás <strong className="text-white">doble porción</strong> de ese ingrediente. Puedes elegir un segundo diferente.</p>
                    </motion.div>
                  )}
                  <div className={`grid gap-4 ${step === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {curr?.items.map(item => {
                      const isArray = Array.isArray(selections[curr.id]);
                      const isSelected = isArray ? selections[curr.id].includes(item) : selections[curr.id] === item;
                      const isDisabled = isArray && !isSelected && selections[curr.id].length >= curr.max;

                      return (
                        <button
                          key={item}
                          onClick={() => toggleSelection(curr.id, item, curr.max)}
                          disabled={isDisabled}
                          className={`text-left p-4 rounded-[16px] transition-all duration-300 font-ui border-2 ${
                            isSelected ? 'bg-[var(--verde-main)] text-white border-[var(--verde-main)] shadow-md' : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-palido)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]'
                          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between group`}
                        >
                          <span className="font-bold text-lg">{item}</span>
                          <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-current bg-white/10 text-white' : 'border-current opacity-30'}`}>
                            {isSelected && <Check size={14} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* PASO 6: PROMO/UPSELL DE BEBIDAS */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🍹</span>
              <div>
                <h2 className="font-ui font-bold text-2xl">¿Algo para tomar?</h2>
                <p className="font-accent text-lg text-[var(--verde-palido)]">Combina tu bowl con bebidas naturales de la casa</p>
              </div>
            </div>

            <div className="space-y-3">
              {BEBIDAS.map((drink) => {
                const isSelected = !!addedDrinks.find(d => d.id === drink.id);
                return (
                  <div 
                    key={drink.id}
                    onClick={() => toggleAddedDrink(drink)}
                    className={`p-4 rounded-[20px] border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-[var(--verde-main)] border-[var(--verde-main)] text-white' : 'bg-[var(--verde-bosque)]/50 border-transparent text-[var(--verde-palido)] hover:bg-[var(--verde-bosque)]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{drink.emoji}</span>
                      <div>
                        <h4 className="font-ui font-bold text-base">{drink.nombre}</h4>
                        <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'} max-w-[220px]`}>{drink.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-ui font-bold block mb-1">{formatPrice(drink.precio)}</span>
                      <button className={`px-4 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase transition-all ${isSelected ? 'bg-white text-[var(--verde-profundo)]' : 'bg-[var(--verde-main)] text-white'}`}>
                        {isSelected ? 'Agregado' : 'Añadir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* PASO 7: RESUMEN Y AGREGAR AL PEDIDO */}
        {step === 7 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bg-[var(--verde-bosque)] p-8 rounded-[24px] border border-[var(--verde-main)]/20">
            <h2 className="font-display italic text-3xl mb-6 text-[var(--verde-main)]">🎉 Tu combo está listo</h2>
            <div className="space-y-3 font-ui text-[var(--verde-palido)] mb-6 text-sm">
              <p>• <strong className="text-white">Base:</strong> {selections.base}</p>
              <p>• <strong className="text-white">Frescuras:</strong> {selections.frescuras.join(' + ')}</p>
              <p>• <strong className="text-white">Sabores:</strong> {selections.sabores.join(' + ')}</p>
              <p>• <strong className="text-white">Proteína:</strong> {selections.proteina || 'Sin proteína'}</p>
              <p>• <strong className="text-white">Salsa:</strong> {selections.salsa}</p>
              {addedDrinks.length > 0 && (
                <p>• <strong className="text-white">Bebidas:</strong> {addedDrinks.map(d => d.nombre).join(', ')}</p>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="font-ui text-lg">Total a pagar:</span>
              <span className={`font-display font-bold text-3xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-[var(--verde-main)]'}`}>{formatPrice(totalPrice)}</span>
            </div>
          </motion.div>
        )}
        </div>

        {/* Bottom navigation — always visible, never scrolls away */}
        <div className="shrink-0 bg-[var(--verde-profundo)] border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] px-6 py-4 lg:px-12">
          {step <= 6 && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`font-ui font-semibold text-sm text-[var(--verde-palido)] hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >← Volver</button>
              <div className="flex gap-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className={`h-2 rounded-[4px] transition-all duration-300 ${i === step ? 'w-8 bg-[var(--verde-main)]' : 'w-2 bg-white/20'}`} />)}
              </div>
              <Button
                onClick={() => isStepCompleted && setStep(s => Math.min(7, s + 1))}
                variant="primary"
                disabled={!isStepCompleted}
                className={`bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] rounded-[16px] transition-all duration-300 ${!isStepCompleted ? 'opacity-40 cursor-not-allowed hover:translate-y-0' : ''}`}
              >
                {step === 6 ? 'Ver Resumen' : 'Siguiente'} <ArrowRight size={16} />
              </Button>
            </div>
          )}
          {step === 7 && (
            <div className="flex gap-3">
              <Button onClick={handleFinishCustomBowl} className="flex-1 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white rounded-[16px]">Agregar al Pedido</Button>
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-[16px] border border-white/20 hover:bg-white/10 transition font-ui font-semibold text-sm text-white">Modificar</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Bowl SVG, centered, desktop only */}
      <div className="hidden lg:block w-full lg:w-1/2 bg-[var(--fondo-crema)] relative">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-12">
          {/* Price chip */}
          <div className="flex items-center justify-between w-full max-w-sm bg-white px-6 py-4 rounded-[20px] mb-10 shadow-sm border border-[var(--verde-palido)]">
            <div>
              <p className="font-ui text-[10px] text-[var(--texto-suave)] uppercase tracking-wider font-bold mb-0.5">Tu bowl personalizado</p>
              <motion.p key={totalPrice} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="font-display font-bold text-3xl text-[var(--verde-profundo)]">{formatPrice(totalPrice)}</motion.p>
            </div>
            {isMaximo && <div className="bg-[var(--maximo-amber)]/10 text-[var(--maximo-amber)] px-3 py-1.5 rounded-[10px] text-xs font-bold">⚡ MÁXIMO</div>}
            {!isMaximo && selections.proteina && <div className="bg-[var(--verde-menta)] text-[var(--verde-main)] px-3 py-1.5 rounded-[10px] text-xs font-bold">Porción sencilla</div>}
          </div>

          {/* Bowl visual con platform effect */}
          <div className="relative w-full max-w-[420px] flex flex-col items-center">
            {/* Subtle radial glow behind bowl */}
            <div className="absolute inset-0 rounded-full bg-[var(--verde-main)]/8 blur-3xl scale-75 -z-10" />
            {/* Bowl SVG */}
            <div className="w-full aspect-square drop-shadow-2xl" style={{ filter: 'drop-shadow(0 32px 40px rgba(18,179,98,0.15)) drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }}>
              <BowlSVG selections={selections} />
            </div>
            {/* Platform shadow */}
            <div className="w-3/4 h-4 bg-[var(--verde-profundo)]/10 rounded-full blur-xl -mt-2" />
          </div>

          {step <= 5 && (
            <p className="font-accent italic text-lg text-[var(--texto-suave)] mt-8 text-center">
              {selections.base ? 'Tu bowl tomando forma...' : 'Visualización en tiempo real...'}
            </p>
          )}
          {step === 7 && <p className="font-display italic text-xl text-[var(--verde-main)] mt-8 text-center font-bold">¡Listo para ordenar!</p>}
        </div>
      </div>
    </div>
  );
};

const BlogView = ({ navigate }) => {
  const [activePost, setActivePost] = useState(null);

  const posts = [
    {
      id: 'aguacate',
      title: "El Aguacate Hass Colombiano: El Oro Verde en tu Plato",
      img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800",
      category: "Nutrición",
      date: "Mayo 2026",
      readTime: "3 min de lectura",
      subtitle: "La ciencia detrás de los ácidos grasos saludables y cómo actúan como catalizadores de absorción de vitaminas.",
      content: [
        "El aguacate Hass es, indiscutiblemente, la joya de la corona en cualquier bowl de nuestra carta. Sin embargo, su valor dentro del menú de ORIGEN trasciende lo delicioso y cremoso de su textura. Detrás de esta fruta se esconde un milagro bioquímico de primer nivel.",
        "Nuestro aguacate es seleccionado rigurosamente en granjas familiares de Tolima y Antioquia. A diferencia de otras grasas vegetales altamente procesadas, el Hass se consume en su estado más puro y fresco. Está cargado principalmente de ácido oleico (grasas monoinsaturadas), el cual ayuda a mantener a raya el colesterol LDL (malo) mientras eleva el HDL (bueno).",
        "Pero el verdadero secreto nutricional radica en la sinergia biológica: muchas de las vitaminas presentes en las verduras de tu bowl (como los betacarotenos de la zanahoria o el licopeno de los tomates cherry) son liposolubles. Esto significa que tu cuerpo solo puede absorberlas adecuadamente si se consumen acompañadas de una grasa saludable de alta densidad.",
        "Al morder una porción de aguacate junto a tus vegetales crujientes, estás multiplicando hasta por cinco veces la absorción real de micronutrientes y antioxidantes. No es solo comer saludable; es diseñar combinaciones científicamente optimizadas para que tu cuerpo aproveche cada gramo de nutrición real."
      ]
    },
    {
      id: 'pesca-sostenible',
      title: "Pesca Sostenible: El Viaje Responsable del Salmón y Atún",
      img: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800",
      category: "Ingredientes",
      date: "Abril 2026",
      readTime: "5 min de lectura",
      subtitle: "Trazabilidad completa desde las corrientes frías del Pacífico hasta la frescura del plato en minutos.",
      content: [
        "Asegurar un pescado fresco, tierno, libre de metales pesados y de origen ético en una ciudad de montaña como Bogotá es uno de los mayores desafíos logísticos que asumimos todos los días en ORIGEN.",
        "Para lograrlo, trabajamos exclusivamente bajo certificaciones internacionales ASC (Aquaculture Stewardship Council) y MSC (Marine Stewardship Council). Esto garantiza que el atún que disfrutas en Origen Agua y el salmón fresco en Origen Tierra provienen únicamente de pesquerías y cultivos que respetan los límites biológicos de las especies marinas y no dañan los lechos de coral.",
        "La cadena de frío es implacable: el pescado se limpia, porciona y congela criogénicamente en origen minutos después de la captura. Posteriormente, viaja vía aérea bajo estrictas auditorías térmicas diarias hasta arribar a nuestras cocinas, donde es descongelado lentamente y fileteado en el momento exacto del servicio.",
        "Este viaje transparente nos permite servirte filetes magros con niveles óptimos de Omega-3 y grasas poliinsaturadas protectoras del sistema cardiovascular. Sin atajos, sin conservantes químicos artificiales. Solo la pureza intacta del mar en tu plato."
      ]
    },
    {
      id: 'equipo-mujeres',
      title: "Las Mujeres Detrás de Cada Bowl: Nuestra Apuesta por la Inclusión",
      img: REAL_MEDIA.staff2,
      gallery: [
        REAL_MEDIA.staff1,
        REAL_MEDIA.staff2,
        REAL_MEDIA.pared1,
        REAL_MEDIA.pared2,
      ],
      category: "Comunidad",
      date: "Junio 2026",
      readTime: "3 min de lectura",
      subtitle: "En ORIGEN creemos que contratar mujeres no es una política de cuotas — es una decisión que hace mejores a los equipos y más justo al mundo.",
      content: [
        "Desde el primer día, en ORIGEN tomamos una decisión que para nosotros es sencilla pero que sigue siendo radical en muchos sectores: preferimos contratar mujeres. No porque sea una tendencia, sino porque creemos profundamente que la inclusión de género en los equipos de trabajo genera ambientes más empáticos, más creativos y más sólidos.",
        "La mayoría de las personas que preparan tus bowls, que cuidan cada ingrediente, que aseguran que cada porción llegue con cariño y precisión, son mujeres colombianas que encontraron en ORIGEN un espacio de trabajo digno, estable y con posibilidades de crecimiento real. Mujeres jefas de hogar, estudiantes, madres, emprendedoras. Cada una con su historia.",
        "Sabemos que en Colombia el acceso al mercado laboral para las mujeres sigue siendo desigual. Por eso nos importa ser parte activa del cambio. No se trata solo de cumplir con una normativa, sino de construir un tipo de empresa donde el talento femenino sea reconocido, bien remunerado y respetado.",
        "Cuando eliges un bowl de ORIGEN, no solo estás alimentando tu cuerpo con ingredientes reales. Estás siendo parte de un modelo de negocio que cree en las personas — en todas ellas, sin importar su género. Gracias por apoyar lo que hacemos."
      ]
    }
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabecera Editorial */}
        <div className="text-center mb-16 animate-in">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.25em] uppercase text-xs mb-4 inline-block">Historias de Origen</span>
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Nuestro Blog</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)] max-w-xl mx-auto">
            Explora las crónicas de los ingredientes, las vidas de nuestros campesinos aliados y el porqué detrás de una nutrición real y honesta.
          </p>
        </div>

        {/* Listado de Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '200ms' }}>
          {posts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => setActivePost(post)}
              className="bg-white rounded-[24px] overflow-hidden border border-[var(--verde-palido)] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgba(18,179,98,0.08)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full"
            >
              {/* Contenedor de Imagen */}
              <div className="h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[10px] font-ui text-[10px] uppercase font-bold text-[var(--verde-main)] tracking-wider shadow-sm">
                  {post.category}
                </div>
                <img loading="lazy" src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              
              {/* Contenido de la Card */}
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-[var(--texto-suave)] font-ui mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-3 leading-snug group-hover:text-[var(--verde-main)] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="font-ui text-sm text-[var(--texto-suave)] leading-relaxed line-clamp-3 mb-6">
                  {post.subtitle}
                </p>
                <span className="font-ui text-[var(--verde-main)] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto pt-4 border-t border-gray-50">
                  Leer historia completa <ArrowRight size={16}/>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Asesor Nutricional Interna */}
        <div className="mt-24 bg-[var(--verde-profundo)] rounded-[32px] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-xl border border-[var(--verde-bosque)]">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--verde-main)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
             <span className="font-ui text-[var(--verde-brillante)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">¿Dudas sobre tu dieta?</span>
             <h2 className="font-display italic text-4xl md:text-5xl mb-6">Tu nutrición es única y personal.</h2>
             <p className="font-ui text-[var(--verde-palido)] mb-8 leading-relaxed text-base md:text-lg">
               Pregúntale a Savia, nuestra asesora nutricional con IA, o agenda un diagnóstico con nuestro equipo para encontrar tu balance idóneo.
             </p>
             <Button onClick={() => {navigate('cuenta'); window.scrollTo(0,0);}} className="mx-auto rounded-[16px] bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] border-0">
               <Sparkles size={18}/> Hablar con Asesor Nutricional
             </Button>
           </div>
        </div>

      </div>

      {/* Lector de Artículos en Pantalla Completa (Overlay Editorial) */}
      <AnimatePresence>
        {activePost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex justify-end"
            onClick={() => setActivePost(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="bg-[var(--fondo-crema)] w-full max-w-3xl h-screen flex flex-col relative z-20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header sticky con botón cerrar y categoría */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[var(--fondo-crema)]">
                <button
                  onClick={() => setActivePost(null)}
                  className="p-2.5 bg-white rounded-full text-gray-500 hover:text-black hover:scale-110 shadow-sm border border-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
                <span className="font-ui text-xs font-bold uppercase tracking-widest text-[var(--verde-main)] bg-[var(--verde-menta)] px-4 py-1.5 rounded-full">
                  {activePost.category}
                </span>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto p-8 md:p-16">
              {/* Contenido Principal */}
              <article className="max-w-2xl mx-auto">
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-[var(--texto-suave)] font-ui mb-4">
                  <span>{activePost.date}</span>
                  <span>•</span>
                  <span>{activePost.readTime}</span>
                  <span>•</span>
                  <span className="font-semibold text-[var(--verde-main)]">Escrito por Origen Editorial</span>
                </div>

                {/* Título Principal */}
                <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--verde-profundo)] leading-tight mb-6">
                  {activePost.title}
                </h1>

                {/* Subtítulo Introductorio */}
                <p className="font-ui text-lg md:text-xl text-[var(--verde-main)] font-medium leading-relaxed mb-10 pb-6 border-b border-gray-100">
                  {activePost.subtitle}
                </p>

                {/* Imagen Destacada */}
                <div className="rounded-[24px] overflow-hidden shadow-md mb-10 aspect-video">
                  <img loading="lazy" src={activePost.img} alt={activePost.title} className="w-full h-full object-cover" />
                </div>

                {/* Párrafos de Lectura Plena */}
                <div className="space-y-6 font-ui text-gray-800 text-base md:text-lg leading-relaxed font-light">
                  {activePost.content.map((paragraph, idx) => (
                    <p key={idx} className="first-letter:font-display first-letter:text-3xl first-letter:font-bold first-letter:text-[var(--verde-main)] first-letter:mr-1">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Galería de Local / Equipo (si el post la incluye) */}
                {activePost.gallery && activePost.gallery.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-10">
                    {activePost.gallery.map((src, idx) => (
                      <div key={idx} className="rounded-[20px] overflow-hidden shadow-md aspect-[3/4]">
                        <img loading="lazy" src={src} alt={`${activePost.title} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Firma de Cierre */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--verde-main)] text-white font-display font-bold text-lg rounded-full flex items-center justify-center">O</div>
                    <div>
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">Comité de Nutrición & Impacto</p>
                      <p className="font-ui text-xs text-[var(--texto-suave)]">ORIGEN Alimentación Consciente</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActivePost(null); navigate('menu'); }}
                    className="font-ui font-bold text-sm text-[var(--verde-main)] hover:text-[var(--verde-profundo)] flex items-center gap-2 transition-all group"
                  >
                    Ver Menú Asociado <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </article>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const UbicacionesView = () => {
  const [localSeleccionado, setLocalSeleccionado] = useState(LOCALES[0]);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="text-center mb-16 animate-in">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Nuestros Espacios</span>
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Ubicaciones</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)] max-w-lg mx-auto">Encuéntranos en los puntos estratégicos de Bogotá y vive la experiencia real en persona.</p>
        </div>

        {/* Locations Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sede Selector list (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            {LOCALES.map((local) => {
              const estaActivo = localSeleccionado.id === local.id;
              return (
                <div 
                  key={local.id}
                  onClick={() => setLocalSeleccionado(local)}
                  className={`p-6 rounded-[24px] cursor-pointer border-2 transition-all duration-300 text-left ${estaActivo ? 'bg-white border-[var(--verde-main)] shadow-[0_10px_30px_rgba(18,179,98,0.12)] scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white hover:border-[var(--verde-palido)]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{local.nombre}</h3>
                    {estaActivo && <span className="bg-[var(--verde-menta)] text-[var(--verde-main)] p-1 rounded-full"><Check size={16} /></span>}
                  </div>
                  <p className="font-ui text-sm text-[var(--texto-suave)] mb-4 flex items-start gap-2">
                    <MapPin size={16} className="text-[var(--verde-main)] shrink-0 mt-0.5" />
                    {local.direccion}
                  </p>
                  
                  {estaActivo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="font-ui text-xs text-[var(--texto-suave)] leading-relaxed italic">"{local.detalles}"</p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {local.amenidades.map((amenidad, idx) => (
                          <span key={idx} className="bg-[var(--verde-menta)] text-[var(--verde-main)] font-ui text-[10px] font-bold uppercase px-2.5 py-1 rounded-[8px]">
                            {amenidad}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Sede Detail View (7 columns) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-[var(--verde-palido)] p-6 md:p-8 flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[var(--verde-menta)] text-[var(--verde-main)] px-3 py-1 rounded-full text-xs font-bold font-ui uppercase tracking-wide">
                    <Clock size={12}/> Abierto Hoy
                  </span>
                  <h2 className="font-display font-bold text-3xl text-[var(--verde-profundo)] mt-2">{localSeleccionado.nombre}</h2>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(localSeleccionado.direccion)}`, '_blank')}
                  className="bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] font-ui font-semibold text-xs py-3 px-6 rounded-[16px] transition-all duration-300 self-start md:self-auto flex items-center gap-2"
                >
                  Cómo llegar <Navigation size={14} />
                </button>
              </div>

              {/* Horarios Grid */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 font-ui text-sm">
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-1">Lunes a Viernes</span>
                  <span className="text-[var(--texto-oscuro)] font-semibold">{localSeleccionado.horarioSemana}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-1">Sábados y Domingos</span>
                  <span className="text-[var(--texto-oscuro)] font-semibold">{localSeleccionado.horarioFinde}</span>
                </div>
              </div>

              {/* Google Maps iFrame */}
              <div className="rounded-[24px] overflow-hidden shadow-inner h-[320px] border border-gray-100 relative bg-gray-100">
                <iframe 
                  src={localSeleccionado.mapaUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy"
                  title="Sede Map"
                />
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const CuentaView = ({ onAddToCart }) => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [chatStep, setChatStep] = useState('welcome');
  const [userChoices, setUserChoices] = useState({ goal: '', diet: '', protein: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const puntos = isAuthenticated ? (profile?.loyalty_points ?? 0) : 0;
  const nombre = isAuthenticated ? (profile?.full_name ?? 'Amigo') : 'Visitante';
  const iniciales = nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'OR';

  const miembroDesde = (() => {
    if (!user?.created_at) return null;
    const d = new Date(user.created_at);
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `Miembro desde ${meses[d.getMonth()]} ${d.getFullYear()}`;
  })();

  const [messages, setMessages] = useState([
    {
      id: 'msg-initial',
      role: 'ai',
      text: '🥦 ¡Hola! Soy Savia, tu asesora nutricional con IA. Te guiaré paso a paso para encontrar tu bowl perfecto. ¿Cuál es tu meta nutricional principal hoy?'
    }
  ]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role, text, recommendationCard = null) => {
    const uniqueId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages(prev => [...prev, { id: uniqueId, role, text, recommendation: recommendationCard }]);
  };

  const handleReset = () => {
    setChatStep('welcome');
    setUserChoices({ goal: '', diet: '', protein: '' });
    const uniqueId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages([
      { 
        id: uniqueId, 
        role: 'ai', 
        text: '🔄 Diagnóstico reiniciado. Vamos a armar otra recomendación perfecta. ¿Cuál es tu meta nutricional principal hoy?' 
      }
    ]);
  };

  const calculateRecommendation = (choices) => {
    const goal = choices.goal;
    const diet = choices.diet;
    const protein = choices.protein;

    if (goal === 'muscle') {
      if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
      if (diet === 'gluten_free') return CARTA.find(b => b.id === 'tierra');
      if (protein === 'fish') return CARTA.find(b => b.id === 'agua');
      return CARTA.find(b => b.id === 'tierra');
    }
    else if (goal === 'fat_loss') {
      if (diet === 'vegan') return CARTA.find(b => b.id === 'natural');
      if (protein === 'fish') return CARTA.find(b => b.id === 'fuego');
      if (diet === 'gluten_free') return CARTA.find(b => b.id === 'agua');
      return CARTA.find(b => b.id === 'aire');
    }
    else if (goal === 'digestion') {
      if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
      if (diet === 'gluten_free') return CARTA.find(b => b.id === 'cosecha');
      if (protein === 'fish') return CARTA.find(b => b.id === 'raiz');
      return CARTA.find(b => b.id === 'paraiso');
    }
    else {
      if (diet === 'vegan') return CARTA.find(b => b.id === 'vital');
      if (protein === 'fish') return CARTA.find(b => b.id === 'tierra');
      if (protein === 'meat') return CARTA.find(b => b.id === 'brasa');
      return CARTA.find(b => b.id === 'dulce');
    }
  };

  const handleOptionClick = (stepCategory, value, label) => {
    addMessage('user', label);
    setIsTyping(true);

    setTimeout(() => {
      const updatedChoices = { ...userChoices, [stepCategory]: value };
      setUserChoices(updatedChoices);

      if (stepCategory === 'goal') {
        setChatStep('diet');
        addMessage('ai', `¡Excelente meta! 🎯 Para ajustar los ingredientes, ¿tienes alguna restricción alimentaria o preferencia dietética hoy?`);
      } 
      else if (stepCategory === 'diet') {
        setChatStep('protein');
        addMessage('ai', `Entendido. Por último, ¿qué tipo de proteína o perfil de sabor te gustaría degustar hoy en tu almuerzo?`);
      } 
      else if (stepCategory === 'protein') {
        setChatStep('result');
        const recommendedBowl = calculateRecommendation(updatedChoices);
        addMessage('ai', `¡Hecho! He procesado tus metas con nuestro algoritmo de nutrición. El bowl que mejor se adapta a lo que tu cuerpo necesita hoy es:`);
        addMessage('ai', `Te sugiero disfrutar de un espectacular *${recommendedBowl.nombre}*.`, recommendedBowl);
      }
      setIsTyping(false);
    }, 850);
  };

  const handleFreeTextSend = async () => {
    if (!inputVal.trim()) return;

    const userMessage = inputVal.trim();
    // Historial reciente para que Savia recuerde el hilo de la conversación
    const history = messages.slice(-MAX_CHAT_HISTORY).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
    addMessage('user', userMessage);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();
      const reply = data.reply ?? 'Lo siento, no pude procesar tu consulta. Intenta de nuevo.';

      const bowlMatch = reply.match(/\[BOWL:(\w+)\]/);
      const cleanReply = reply.replace(/\[BOWL:\w+\]/, '').trim();
      const recommendedBowl = bowlMatch ? CARTA.find(b => b.id === bowlMatch[1]) : null;

      addMessage('ai', cleanReply, recommendedBowl);
    } catch {
      addMessage('ai', 'Sin conexión al asesor nutricional. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setIsTyping(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-[var(--verde-palido)]">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center mx-auto mb-6">
              <User size={36} className="text-[var(--verde-main)]" />
            </div>
            <h2 className="font-display italic text-4xl text-[var(--verde-profundo)] mb-4">Tu Cuenta Origen</h2>
            <p className="font-ui text-[var(--texto-suave)] mb-8 max-w-sm mx-auto">
              Inicia sesión para ver tus puntos, historial de pedidos y el asesor nutricional con IA.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(42,110,72,0.25)] flex items-center justify-center gap-2"
              >
                Iniciar sesión <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-profundo)] hover:text-white transition-all"
              >
                Crear cuenta gratis
              </button>
            </div>
            <p className="font-ui text-xs text-[var(--texto-suave)] mt-6">Gana 50 puntos con cada compra.</p>
          </div>
        </div>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-[var(--verde-palido)] animate-in">

          {/* Perfil del Usuario */}
          <div className="flex items-center gap-4 mb-12 border-b border-[var(--verde-palido)] pb-10">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center text-[var(--verde-main)] font-display text-3xl font-bold flex-shrink-0">{iniciales}</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-4xl text-[var(--verde-profundo)] mb-1">Hola, {nombre.split(' ')[0]}.</h2>
              {miembroDesde && (
                <p className="font-ui text-xs text-[var(--texto-suave)] mb-2">{miembroDesde}</p>
              )}
              <div className="inline-flex items-center gap-2 bg-[var(--dorado-suave)]/20 text-[var(--dorado-fuerte)] px-4 py-1.5 rounded-[8px] font-ui font-bold text-sm">
                <Award size={16}/> {puntos} Puntos Origen
              </div>
            </div>
            <button
              onClick={signOut}
              className="font-ui text-xs text-[var(--texto-suave)] hover:text-red-500 transition-colors border border-[var(--verde-palido)] px-3 py-1.5 rounded-[10px] flex-shrink-0"
            >
              Salir
            </button>
          </div>

          {/* CHATBOT REESTRUCTURADO COMO EMBUDO EXPERTO */}
          <div className="bg-[var(--verde-profundo)] rounded-[24px] p-6 text-white relative overflow-hidden flex flex-col min-h-[500px] shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--verde-main)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            
            {/* Cabecera del Chat */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--verde-main)] animate-pulse"></span>
                <p className="font-ui text-xs font-bold uppercase tracking-widest text-[var(--verde-palido)]">Diagnóstico Nutricional Experto</p>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[var(--verde-palido)] hover:text-white bg-white/10 px-3 py-1.5 rounded-[10px] transition-colors"
              >
                🔄 Reiniciar
              </button>
            </div>

            {/* Ventana de Conversación */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[350px] scrollbar-hide">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Globo de texto */}
                  <div className={`p-4 rounded-[16px] font-ui text-sm max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-[var(--verde-main)] text-white rounded-tr-none' : 'bg-white/10 text-[var(--verde-menta)] rounded-tl-none'}`}>
                    {m.text}
                  </div>

                  {/* Renderizado especial del Bowl Recomendado dentro de la burbuja */}
                  {m.recommendation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 bg-white text-[var(--verde-profundo)] p-4 rounded-[20px] border border-[var(--verde-palido)] w-full max-w-[280px] shadow-lg flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--verde-menta)] border border-gray-100 flex-shrink-0">
                          {m.recommendation.imagen ? (
                            <img loading="lazy" src={m.recommendation.imagen} alt={m.recommendation.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🥗</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg leading-tight">{m.recommendation.nombre}</h4>
                          <span className="text-xs bg-[var(--verde-menta)] text-[var(--verde-main)] px-2 py-0.5 rounded-full font-bold font-ui inline-block mt-1">Sugerido</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--texto-suave)] leading-relaxed font-ui">Con proteína de {m.recommendation.proteina} fresca, acompañado de ingredientes premium locales.</p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                        <span className="font-display font-bold text-base text-[var(--verde-main)]">{formatPrice(m.recommendation.precio)}</span>
                        <button 
                          onClick={() => onAddToCart(m.recommendation)}
                          className="bg-[var(--verde-main)] text-white font-ui font-bold text-xs px-4 py-2 rounded-[12px] hover:bg-[var(--verde-vivo)] transition-colors flex items-center gap-1"
                        >
                          Ordenar <ShoppingBag size={12}/>
                        </button>
                      </div>
                    </motion.div>
                  )}

                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-white/50 text-xs font-ui pl-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  <span>Savia está procesando...</span>
                </div>
              )}
            </div>

            {/* Opciones del Árbol de Decisiones */}
            <div className="relative z-10 shrink-0 border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                
                {chatStep === 'welcome' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">Elige tu Meta Principal:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleOptionClick('goal', 'muscle', '💪 Ganar Masa & Rendimiento')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">💪 Ganar Masa</button>
                      <button onClick={() => handleOptionClick('goal', 'fat_loss', '🏃‍♀️ Definir & Perder Grasa')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🏃‍♀️ Perder Grasa</button>
                      <button onClick={() => handleOptionClick('goal', 'digestion', '🌿 Digestión & Bienestar')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🌿 Digestión Sana</button>
                      <button onClick={() => handleOptionClick('goal', 'energy', '⚡ Energía Instantánea')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">⚡ Almuerzo Rápido</button>
                    </div>
                  </motion.div>
                )}

                {chatStep === 'diet' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">¿Prefieres alguna dieta o restricción?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleOptionClick('diet', 'none', '❌ Ninguna restricción')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">❌ Sin restricción</button>
                      <button onClick={() => handleOptionClick('diet', 'gluten_free', '🌾 Dieta Sin Gluten')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🌾 Sin Gluten</button>
                      <button onClick={() => handleOptionClick('diet', 'vegan', '🥕 Opción 100% Vegana')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🥕 100% Vegano</button>
                      <button onClick={() => handleOptionClick('diet', 'dairy_free', '🥛 Sin Lácteos')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🥛 Sin Lácteos</button>
                    </div>
                  </motion.div>
                )}

                {chatStep === 'protein' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
                    <p className="text-[11px] uppercase font-bold text-[var(--verde-palido)] mb-2 tracking-widest">Elige tu proteína o sabor favorito:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleOptionClick('protein', 'fish', '🐟 Salmón, Camarón o Atún')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🐟 Pescados</button>
                      <button onClick={() => handleOptionClick('protein', 'meat', '🍗 Pollo o Lomo de Res/Cerdo')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🍗 Proteína Animal</button>
                      <button onClick={() => handleOptionClick('protein', 'plant', '🌱 Proteína Vegetal (Tofu/Huevo)')} className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-left px-4 py-3 rounded-[12px] text-xs font-ui font-semibold transition-all hover:translate-x-1">🌱 Tofu o Huevos</button>
                    </div>
                  </motion.div>
                )}

                {chatStep === 'result' && !isTyping && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="p-3 bg-white/5 rounded-[16px] flex items-center justify-between">
                    <span className="text-xs text-[var(--verde-palido)] font-ui">¿Quieres realizar otro diagnóstico?</span>
                    <button 
                      onClick={handleReset}
                      className="bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] font-ui font-bold text-xs px-4 py-2 rounded-[12px] transition-all flex items-center gap-1.5 shadow-md"
                    >
                      Nuevo Diagnóstico <ArrowRight size={14}/>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Input de texto libre */}
            <div className="mt-4 flex gap-2 bg-white/5 p-2 rounded-[16px] border border-white/10 focus-within:border-[var(--verde-main)] transition-colors relative z-10 shrink-0">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFreeTextSend()}
                placeholder="Escribe tu antojo o meta (ej: sin gluten, ganar masa...)" 
                className="flex-1 bg-transparent border-none px-4 font-ui text-sm focus:outline-none text-white placeholder-white/40"
              />
              <button 
                onClick={handleFreeTextSend}
                className="w-10 h-10 bg-[var(--verde-main)] text-white rounded-[12px] flex items-center justify-center hover:bg-[var(--verde-vivo)] transition-all"
              >
                <ArrowRight size={16}/>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estado Global del Carrito
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Agregar al carrito (Lógica generalizable)
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCheckoutOpen(true); // Abre automáticamente el modal para ver el carrito y motivar upselling
  };

  // Modificar cantidades de artículos en carrito
  const handleUpdateQty = (product, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === product.id) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  // Eliminar artículo completo del pedido
  const handleRemoveItem = (product) => {
    setCart(prev => prev.filter(item => item.id !== product.id));
  };

  // Confirmar y generar mensaje de WhatsApp
  const handleConfirmOrder = async (deliveryData) => {
    const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    // Guardar pedido y sumar puntos en Supabase si el usuario está autenticado
    if (isAuthenticated && user) {
      try {
        const itemsData = cart.map(item => ({
          nombre: item.nombre,
          precio: item.precio,
          quantity: item.quantity,
          ...(item.esBuilder ? { base: item.base, proteina: item.proteina } : {}),
        }));
        await createOrder({
          user_id: user.id,
          items: itemsData,
          total_price: cartTotal,
          delivery_type: deliveryData.modalidad,
          store_location: deliveryData.modalidad === 'Recoger en Local' ? deliveryData.store?.nombre : null,
          delivery_address: deliveryData.modalidad === 'Domicilio' ? deliveryData.direccion : null,
          delivery_details: deliveryData.detalles ?? null,
        });
        await addLoyaltyPoints(user.id, 50);
        await addPointsHistory(user.id, 50, `Compra por ${formatPrice(cartTotal)}`);
        await refreshProfile();
      } catch (err) {
        console.error('Error guardando pedido en Supabase:', err);
      }
    }

    // Generar bloque de texto estructurado para WhatsApp
    let orderDetailText = `🌿 *NUEVO PEDIDO ORIGEN* 🌿\n`;
    orderDetailText += `----------------------------------\n`;
    
    const bowls = cart.filter(item => !item.desc);
    const bebidas = cart.filter(item => item.desc);

    if (bowls.length > 0) {
      orderDetailText += `🥣 *BOWL(S):*\n`;
      bowls.forEach(b => {
        orderDetailText += `• ${b.quantity}x ${b.nombre} (${formatPrice(b.precio * b.quantity)})\n`;
        if (b.esBuilder) {
          orderDetailText += `  (Base: ${b.base} | Frescuras: ${b.frescuras.join(', ')} | Proteína: ${b.proteina})\n`;
        }
      });
      orderDetailText += `\n`;
    }

    if (bebidas.length > 0) {
      orderDetailText += `🍹 *BEBIDA(S):*\n`;
      bebidas.forEach(beb => {
        orderDetailText += `• ${beb.quantity}x ${beb.nombre} (${formatPrice(beb.precio * beb.quantity)})\n`;
      });
      orderDetailText += `\n`;
    }

    orderDetailText += `----------------------------------\n`;
    orderDetailText += `📍 *MODALIDAD:* ${deliveryData.modalidad}\n`;
    
    if (deliveryData.modalidad === 'Recoger en Local') {
      orderDetailText += `🏪 *SEDE SELECCIONADA:* ${deliveryData.store?.nombre}\n`;
      orderDetailText += `📍 *DIRECCIÓN SEDE:* ${deliveryData.store?.direccion}\n`;
    } else {
      orderDetailText += `🏠 *ENTREGAR EN:* ${deliveryData.direccion}\n`;
      if (deliveryData.detalles) {
        orderDetailText += `📝 *INDICACIONES:* ${deliveryData.detalles}\n`;
      }
    }

    orderDetailText += `----------------------------------\n`;
    orderDetailText += `💰 *TOTAL A PAGAR:* ${formatPrice(cartTotal)}\n`;
    orderDetailText += `----------------------------------\n`;
    orderDetailText += `¡Preparar al instante con amor real! 🌿`;

    // Abrir WhatsApp con número real o placeholder estándar
    window.open(`https://wa.me/573103112799?text=${encodeURIComponent(orderDetailText)}`, '_blank');
    
    // Limpiar carrito
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const NAV_LINKS = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'menu', label: 'Carta Origen' },
    { id: 'builder', label: 'Arma tu Bowl' },
    { id: 'blog', label: 'Historias / Blog' },
    { id: 'ubicaciones', label: 'Ubicaciones' },
  ];

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] selection:bg-[var(--verde-main)] selection:text-white flex flex-col">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&family=Baloo+2:wght@700;800&display=swap');
        :root {
          --verde-profundo: #131E14; --verde-bosque: #2F3E2B; --verde-main: #12B362;
          --verde-oliva: #4E6047; --verde-vivo: #1EAD61; --verde-brillante: #3EE087; --verde-palido: #C8F0DC;
          --verde-menta: #E8F9F0; --dorado-fuerte: #D4A017; --dorado-suave: #F0C040;
          --crema-calido: #FDF5E0; --fondo-crema: #F1F4EA; --texto-oscuro: #0D1F0F;
          --texto-suave: #4E5C4E; --kraft: #D4A574; --maximo-amber: #F09030;
          --amarillo-quemado: #DE9F22; --amarillo-vivo: #F0B429; --amarillo-suave: #FBDE8D;
        }
        .font-display { font-family: 'Fraunces', serif; }
        .font-ui { font-family: 'Outfit', sans-serif; }
        .font-accent { font-family: 'Instrument Serif', serif; }
        .font-logo { font-family: 'Baloo 2', sans-serif; font-weight: 800; }
        body { margin: 0; padding: 0; background-color: var(--fondo-crema); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .animate-in { opacity: 0; transform: translateY(24px); animation: fadeUp 800ms forwards cubic-bezier(0.23, 1, 0.32, 1); }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .card-maximo {
          animation: glowRespiration 3s infinite alternate ease-in-out;
        }
        @keyframes glowRespiration {
          0% { box-shadow: 0 4px 20px rgba(240, 144, 48, 0.15); border-color: rgba(240, 144, 48, 0.4); }
          100% { box-shadow: 0 10px 40px rgba(240, 144, 48, 0.35); border-color: rgba(240, 144, 48, 0.9); }
        }
      `}} />

      {/* --- NAVBAR REDISEÑADO CON LOGO EN LA MITAD --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || activeTab !== 'inicio' ? 'bg-[var(--verde-main)] border-b border-white/15 shadow-sm py-4' : 'bg-transparent py-6 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-16">

          {/* LADO IZQUIERDO: Menú hamburguesa + Explorar → Carta */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all text-white"
            >
              <MenuIcon size={20} />
            </button>
            <button
              onClick={() => { setActiveTab('menu'); setIsMobileMenuOpen(false); }}
              className="hidden sm:flex items-center gap-1.5 font-ui text-xs font-bold tracking-widest text-white uppercase hover:text-[var(--amarillo-suave)] transition-all"
            >
              Explorar <ArrowRight size={12} />
            </button>
          </div>

          {/* CENTRO: Logo ORIGEN alineado perfectamente */}
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10"
            onClick={() => { setActiveTab('inicio'); setIsMobileMenuOpen(false); }}
          >
            <h1 className="font-logo text-2xl md:text-3xl tracking-[0.2em] text-white leading-none">ORIGEN</h1>
            <span className="font-ui text-[8px] md:text-[9px] text-[var(--amarillo-suave)] uppercase tracking-[0.2em] mt-1 font-bold">Comida Saludable</span>
          </div>

          {/* LADO DERECHO: Cuenta + Botón de Carrito de Compras */}
          <div className="flex items-center gap-4 z-10">
            <button onClick={() => { setActiveTab('cuenta'); setIsMobileMenuOpen(false); }} className="text-white hover:text-[var(--amarillo-suave)] transition-colors w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <User size={18}/>
            </button>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative w-10 h-10 rounded-full bg-[var(--amarillo-vivo)] hover:bg-[var(--amarillo-suave)] transition-colors flex items-center justify-center text-[var(--verde-profundo)]"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- SUBMENÚ DESLIZANTE DESDE LA IZQUIERDA (SIDE DRAWER) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-md bg-[#05190C] border-r border-white/10 z-[160] p-8 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex justify-between items-center pb-8 border-b border-white/10">
                  <div className="flex flex-col">
                    <span className="font-logo text-xl text-white tracking-wide">ORIGEN</span>
                    <span className="font-ui text-[8px] text-[var(--verde-main)] uppercase tracking-[0.2em] font-bold">Navegación</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-white hover:text-[var(--verde-main)] bg-white/10 p-2.5 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-8 mt-12">
                  {NAV_LINKS.map(link => (
                    <button 
                      key={link.id} 
                      onClick={() => { setActiveTab(link.id); setIsMobileMenuOpen(false); }}
                      className="text-left font-display italic text-3xl sm:text-4xl transition-all hover:translate-x-2 duration-300 flex items-center justify-between group"
                    >
                      <span className={activeTab === link.id ? 'text-[var(--verde-main)]' : 'text-white group-hover:text-[var(--verde-palido)]'}>
                        {link.label}
                      </span>
                      <ArrowRight size={20} className="text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--verde-main)] transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 flex flex-col gap-6">
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors text-white">
                    <Instagram size={18}/>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors text-white">
                    <Facebook size={18}/>
                  </button>
                </div>
                <div className="font-ui text-xs text-white/50">
                  Bogotá, Colombia • CC Salitre Plaza
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- RENDERIZADOR PRINCIPAL --- */}
      <main className="relative z-10 flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><HomeView navigate={setActiveTab}/></motion.div>}
          {activeTab === 'menu' && <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CartaView onAddToCart={handleAddToCart}/></motion.div>}
          {activeTab === 'builder' && <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BuilderView onAddToCart={handleAddToCart}/></motion.div>}
          {activeTab === 'blog' && <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BlogView navigate={setActiveTab}/></motion.div>}
          {activeTab === 'ubicaciones' && <motion.div key="ubicaciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><UbicacionesView/></motion.div>}
          {activeTab === 'cuenta' && <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CuentaView onAddToCart={handleAddToCart}/></motion.div>}
        </AnimatePresence>
      </main>

      {/* --- MODAL DE CHECKOUT INTEGRADOR --- */}
      {isCheckoutOpen && (
        <CheckoutModal 
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirmOrder={handleConfirmOrder}
        />
      )}

      {/* --- SAVIA: IA NATIVA DE RECOMENDACIÓN --- */}
      {/* Se oculta el botón flotante en Builder: ahí la barra inferior "Siguiente" ocupa esa misma esquina en móvil */}
      <SaviaWidget carta={CARTA} formatPrice={formatPrice} onAddToCart={handleAddToCart} navigate={setActiveTab} hideFab={activeTab === 'builder'} />

      {/* --- GLOBAL FOOTER --- */}
      <Footer navigate={setActiveTab} />

    </div>
  );
}
