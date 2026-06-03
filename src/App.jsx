import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Leaf, MapPin, ArrowRight, Instagram, Facebook, User, Menu as MenuIcon, X, Sparkles, MessageCircle, Navigation, Check, Store, ShoppingBag, Wifi, Compass, Award, Clock } from 'lucide-react';

/* =========================================================================
   SISTEMA DE DISEÑO & DATA OFICIAL (CON EL NUEVO VERDE VIBRANTE)
   ========================================================================= */

const COLORS = {
  verdeProfundo: '#05190C', // Un tono más oscuro y elegante para contrastar
  verdeBosque: '#0D2818',
  verdeMain: '#12B362',     // El color verde vibrante exacto de tu captura de pantalla
  verdeVivo: '#1EAD61',     // Hover y variaciones dinámicas
  verdeBrillante: '#3EE087',
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
    tag: 'Vegano',
    dietary: ['Gluten-Free', 'Vegan']
  },
  { 
    id: 'vital', 
    nombre: 'ORIGEN VITAL', 
    proteina: 'Tofu', 
    precio: 22900, 
    imagen: null, 
    badge: { texto: '100% Plant', color: '#1EAD61', bg: '#E8F5E8' }, 
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
  'Zuquini': '#7DC67E', 'Pepino': '#A8D87A', 'Tomate Cherry': '#E8584A', 'Zanahoria': '#F08030', 'Repollo Encurtido': '#C870A8', 'Cebolla Encurtida': '#E0A0C8', 'Berenjena': '#6040A0', 'Brócoli': '#40A040',
  'Maíz': '#FFD040', 'Mango': '#F0A030', 'Manzana': '#E87080', 'Parmesano': '#F0E0A0', 'Aguacate': '#80C060', 'Jalapeños': '#40A040', 'Lenteja Crocante': '#C87820', 'Garbanzos': '#D4A050',
  'Pechuga de Pollo': '#E0A060', 'Huevo Cocido': '#F8D870', 'Tofu': '#F0E8D0', 'Carne': '#8B4020', 'Lomo de Cerdo': '#A05030', 'Máximo (Doble)': '#E0A060',
  'Pesto Natural': '#3DB870', 'Yogurt de Casa': '#F8F8F8', 'Mango Picante': '#F08030', 'Dulce Balance': '#F8D040', 'Vino Mango': '#8040A0'
};

const HERO_IMAGE = "https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780260556/A_hand_with_warm_natural_202605311437_jtu8or.jpg"; 

// Datos de las ubicaciones reales
const LOCALES = [
  {
    id: 'salitre',
    nombre: 'Salitre 372',
    direccion: 'Calle 24a # 69-76, Bogotá',
    detalles: 'Cerca de la zona empresarial y hotelera de Salitre. Perfecto para un almuerzo rápido y cargado de energía real.',
    horarioSemana: '11:00 AM – 9:00 PM',
    horarioFinde: '11:00 AM – 8:00 PM',
    amenidades: ['Pet Friendly', 'Wi-Fi gratis', 'Zona de terraza'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.6713600984107!2d-74.11326462417742!3d4.652613195321855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9be4a9efdf87%3A0x6b9ef2df3f486851!2sAv.%20El%20Dorado%20%2369%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012345678!5m2!1ses!2sco'
  },
  {
    id: 'chile',
    nombre: 'Av Chile 408b',
    direccion: 'Calle 72 # 10-34, Local 408b, Bogotá',
    detalles: 'En el epicentro financiero de Bogotá. La pausa perfecta y nutritiva para los profesionales más exigentes.',
    horarioSemana: '11:00 AM – 8:00 PM',
    horarioFinde: '11:00 AM – 5:00 PM',
    amenidades: ['Para llevar', 'Estación de carga', 'Opciones Veganas'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.54347712391!2d-74.05923162417724!3d4.657538995316499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a5be41bb59b%3A0xe744e8ec50672e!2sCl.%2072%20%2310-34%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012355678!5m2!1ses!2sco'
  },
  {
    id: 'nuestro-bogota',
    nombre: 'Nuestro Bogotá L3-127',
    direccion: 'Av. Ciudad de Cali # 52-25, Local L3-127, Bogotá',
    detalles: 'Ubicados en el Centro Comercial Nuestro Bogotá. El spot ideal para alimentarte sanamente antes o después de tu viaje.',
    horarioSemana: '11:00 AM – 9:00 PM',
    horarioFinde: '11:00 AM – 9:00 PM',
    amenidades: ['Zona infantil', 'Parqueadero cubierto', 'Pagos digitales'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.55621376841!2d-74.12431762417726!3d4.655255995318042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9b008d5dfd35%3A0x67db23315a6e8b2b!2sCC%20Nuestro%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012365678!5m2!1ses!2sco'
  }
];

/* =========================================================================
   UTILIDADES
   ========================================================================= */

const formatPrice = (price) => `$${price.toLocaleString('es-CO')}`;

const generarMensajeWhatsApp = (pedido) => {
  const msg = `🌿 *PEDIDO ORIGEN*\n\n🥣 *${pedido.nombre}* — ${formatPrice(pedido.precio)}\n${pedido.esBuilder ? `📋 *Mi combinación:*\n• Base: ${pedido.base}\n• Frescuras: ${pedido.frescuras.join(', ')}\n• Sabores: ${pedido.sabores.join(', ')}\n• Proteína: ${pedido.proteina}\n• Salsa: ${pedido.salsa}\n` : ''}\n📍 *Modalidad:* ${pedido.modalidad}\n\n¡Gracias! 🌿`;
  window.open(`https://wa.me/573000000000?text=${encodeURIComponent(msg)}`, '_blank');
};

/* =========================================================================
   COMPONENTES UI (Diseño Squircle / Editorial)
   ========================================================================= */

const Button = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
  const base = "px-8 py-3.5 rounded-[16px] font-ui font-bold tracking-wider text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
    ghost: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5",
    outline: "border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] hover:bg-[var(--verde-profundo)] hover:text-white"
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

/* =========================================================================
   MODAL DE SELECCIÓN DE PEDIDO (RECOGER O DOMICILIO)
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
            <button onClick={() => onConfirm('Recoger en Local')} className="flex items-center gap-5 p-6 bg-white border border-[var(--verde-palido)] rounded-[24px] hover:border-[var(--verde-main)] hover:shadow-[0_10px_30px_rgba(18,179,98,0.15)] group transition-all duration-300 text-left">
              <div className="bg-[var(--verde-menta)] p-4 rounded-[16px] text-[var(--verde-main)] group-hover:scale-110 group-hover:bg-[var(--verde-main)] group-hover:text-white transition-all">
                <Store size={28} />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-1">Recoger en local</h3>
                <p className="font-ui text-sm text-[var(--texto-suave)]">Pasa por tu bowl sin filas.</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-[var(--verde-palido)] group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={() => onConfirm('Domicilio')} className="flex items-center gap-5 p-6 bg-white border border-[var(--verde-palido)] rounded-[24px] hover:border-[var(--verde-main)] hover:shadow-[0_10px_30px_rgba(18,179,98,0.15)] group transition-all duration-300 text-left">
              <div className="bg-[var(--verde-menta)] p-4 rounded-[16px] text-[var(--verde-main)] group-hover:scale-110 group-hover:bg-[var(--verde-main)] group-hover:text-white transition-all">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-1">Pedir a domicilio</h3>
                <p className="font-ui text-sm text-[var(--texto-suave)]">Te lo llevamos fresco y rápido.</p>
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
            onClick={() => window.open('https://wa.me/573000000000', '_blank')} 
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

/* =========================================================================
   VISTAS DE PESTAÑAS
   ========================================================================= */

// --- 1. HERO INICIO ---
const HomeView = ({ navigate }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="w-full relative bg-[var(--fondo-crema)] pb-32">
      
      {/* Hero Inmersivo */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-[#050505]">
        <motion.div style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.15]) }} className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Origen Bowl" className="w-full h-full object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,40,24,0.4)] to-[rgba(5,25,12,0.9)]"></div>
        </motion.div>

        <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="font-display italic uppercase tracking-[0.3em] text-[12px] md:text-[14px] text-white/80 mb-6 font-semibold">Bogotá · Nutrición Honesta</p>
          <h1 className="font-display font-bold text-5xl md:text-7.5xl text-white leading-[1.05] mb-6 drop-shadow-2xl">
            Nutrición desde<br/>el origen.
          </h1>
          <p className="font-ui text-lg md:text-xl text-[var(--verde-menta)] font-light drop-shadow-md max-w-lg mx-auto">
            Recetas pensadas para alimentar tu cuerpo con la velocidad que necesitas y el sabor que mereces.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button onClick={() => navigate('menu')} variant="primary" className="bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)]">
              Ver Carta <ArrowRight size={16} />
            </Button>
            <Button onClick={() => navigate('builder')} variant="ghost" className="hover:bg-white hover:text-[var(--verde-profundo)]">
              Armar Mi Bowl <Sparkles size={16} />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Barra de Confianza */}
      <div className="w-full bg-[var(--verde-bosque)] border-y border-[var(--verde-main)]/20 py-4 overflow-hidden flex relative z-20 shadow-lg">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, ease: "linear", repeat: Infinity }} className="flex w-max">
          {[1, 2, 3, 4].map((_, idx) => (
            <div key={idx} className="flex items-center gap-12 px-6">
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-main)]">🌿</span> 100% Natural</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-main)]">⚡</span> Alto en Proteína</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-main)]">🎯</span> 12 Combinaciones</span>
              <span className="flex items-center gap-2 text-[var(--verde-menta)] font-ui font-medium whitespace-nowrap"><span className="text-[var(--verde-main)]">📍</span> Bogotá</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bloques de Acción */}
      <div className="w-full flex flex-col md:flex-row bg-[var(--fondo-crema)] relative z-20 max-w-7xl mx-auto px-6 py-12 gap-6">
        <div onClick={() => navigate('builder')} className="relative flex-1 bg-[var(--verde-profundo)] p-10 md:p-14 cursor-pointer group overflow-hidden rounded-[24px] flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--verde-bosque)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--verde-main)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="font-display italic text-4xl md:text-5xl text-white mb-4 transition-transform duration-500 group-hover:-translate-y-1">Arma tu<br/><span className="text-[var(--verde-main)]">Origen</span></h2>
            <p className="font-ui text-[var(--verde-palido)] max-w-xs text-base">Crea tu obra maestra paso a paso con nuestros ingredientes frescos.</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-[16px] bg-[var(--verde-main)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mt-8 shadow-md">
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

      {/* Sección Editorial con Galería de Fotos Reales */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center bg-[var(--fondo-crema)] relative z-20">
        
        {/* Galería Interactiva con las fotos reales de Cloudinary */}
        <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5] relative group">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_RAIZ_ATUN_puhjsi.webp" alt="Origen Raíz" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square relative group">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_HUEVO_pgzav3.webp" alt="Origen Huevo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-square relative group">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_LOMO_zqrfqh.webp" alt="Origen Lomo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-[24px] overflow-hidden shadow-md border border-black/5 aspect-[4/5] relative group">
              <img src="https://res.cloudinary.com/dfj0ckm10/image/upload/q_auto/f_auto/v1780285300/ORIGEN_COSECHA_LOMO_cfbzy9.webp" alt="Origen Cosecha" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
           <button onClick={() => {navigate('blog'); window.scrollTo(0,0);}} className="w-max border-b-2 border-[var(--verde-main)] text-[var(--verde-profundo)] font-ui font-bold text-lg pb-1 hover:text-[var(--verde-main)] transition-colors flex items-center gap-2 group">
             Descubre nuestras historias <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. CARTA ORIGEN (DISEÑO PREMIUM MINIMALISTA / LUZ) ---
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
        
        {/* Header Carta Light Mode */}
        <div className="text-center mb-16 animate-in">
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Carta Origen</h1>
          <p className="font-ui text-lg text-[#2D5A4A]">12 combinaciones perfectas, cada una con su historia.</p>
        </div>

        {/* Filtros Light Mode */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-hide animate-in justify-start md:justify-center" style={{ animationDelay: '200ms' }}>
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

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {bowlsFiltrados.map((bowl, idx) => (
              <motion.div 
                layout 
                key={bowl.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                transition={{ duration: 0.4 }} 
                className={`bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8F0E8] hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-[550px] relative group cursor-pointer ${bowl.esMaximo ? 'border-[var(--maximo-amber)] ring-1 ring-[var(--maximo-amber)]/20 shadow-[0_4px_20px_rgba(240,144,48,0.1)]' : ''}`}
                onClick={() => onOrderRequest(bowl)}
              >
                
                {/* Badge Superior Izquierdo */}
                <div className="absolute top-6 left-6 z-20">
                  <span 
                    className="px-3 py-1.5 rounded-[12px] text-[10px] font-ui font-bold uppercase tracking-wide"
                    style={{ backgroundColor: bowl.badge.bg, color: bowl.badge.color }}
                  >
                    {bowl.badge.texto}
                  </span>
                </div>

                {/* Imagen Circular del Bowl */}
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

                {/* Textos y Etiquetas */}
                <div className="flex-grow flex flex-col items-center">
                  <h3 className="font-display font-bold text-[22px] text-[#1A1A1A] leading-[1.2] text-center mb-4">
                    {bowl.nombre}
                  </h3>
                  
                  {/* Ingredientes como "Tags Dietéticos" */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {bowl.ingredientes.map((ing, i) => (
                      <span key={i} className="bg-[#F5F5F5] text-[#2D3A2D] text-[10px] font-medium px-2.5 py-1 rounded-[6px]">
                        {ing}
                      </span>
                    ))}
                  </div>

                  {/* Dietary tags en base a la especificación */}
                  {bowl.dietary && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {bowl.dietary.map((tag, i) => (
                        <span key={i} className="bg-[#E8F5E8] text-[var(--verde-main)] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Precio y Botón (Footer de la tarjeta) */}
                <div className="mt-6 flex flex-col items-center w-full">
                  <div className="font-display font-bold text-[26px] text-[var(--verde-main)] mb-4">
                    {formatPrice(bowl.precio)}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onOrderRequest(bowl); }} 
                    className="w-full rounded-[24px] border-2 border-[#1A1A1A] text-[#1A1A1A] bg-white text-[13px] font-bold uppercase tracking-wide py-3 hover:bg-[var(--verde-main)] hover:border-[var(--verde-main)] hover:text-white transition-all duration-300 shadow-none hover:shadow-[0_8px_20px_rgba(18,179,98,0.25)] flex justify-center items-center gap-2 group-hover:-translate-y-0.5"
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

// --- 3. BOWL BUILDER SVG & WIZARD ---
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
    5: { id: 'salsa', max: 1, icon: '💚', title: 'El toque final', sub: 'La salsa que lo une todo', items: ['Pesto Natural', 'Yogurt de Casa', 'Mango Picante', 'Dulce Balance', 'Vino Mango'] }
  };

  const curr = OPTIONS[step];

  // Validación de paso completado
  const isStepCompleted = useMemo(() => {
    const currentSelection = selections[curr.id];
    if (Array.isArray(currentSelection)) {
      return currentSelection.length > 0;
    }
    return currentSelection !== '';
  }, [selections, curr]);

  return (
    <div className="pt-24 bg-[var(--fondo-crema)] w-full flex flex-col lg:flex-row min-h-screen pb-16 lg:pb-0">
      <div className="w-full lg:w-1/2 bg-[var(--verde-profundo)] text-white p-6 lg:p-12 lg:min-h-screen flex flex-col justify-between relative z-20">
        <div className="mb-10">
          <h1 className="font-display italic text-4xl md:text-5xl text-white mb-2">Arma tu <span className="text-[var(--verde-main)]">Origen</span></h1>
          <p className="font-ui text-[var(--verde-palido)] opacity-80">5 pasos. Infinitas combinaciones.</p>
        </div>

        <div className="lg:hidden sticky top-20 bg-[var(--verde-bosque)]/95 backdrop-blur-md p-4 rounded-[16px] mb-8 flex justify-between items-center border border-[var(--verde-main)]/20 z-[60] shadow-lg">
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
                          : (isSelected ? 'bg-[var(--verde-main)] text-[var(--verde-profundo)] border-[var(--verde-main)]' : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-palido)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]')
                      } border-2 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between group`}
                    >
                      <div>
                         <div className={`font-bold text-lg mb-1 ${isMaxCard && !isSelected ? 'text-[#F09030]' : ''}`}>{isMaxCard ? '⚡ MÁXIMO' : item}</div>
                         {isMaxCard && <div className="text-xs opacity-80">+ $6.000 Doble Proteína</div>}
                      </div>
                      <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-[var(--verde-profundo)] bg-[var(--verde-profundo)] text-[var(--verde-main)]' : 'border-current opacity-30'}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bg-[var(--verde-bosque)] p-8 rounded-[24px] border border-[var(--verde-main)]/20">
            <h2 className="font-display italic text-3xl mb-6 text-[var(--verde-main)]">🎉 Tu Origen está listo</h2>
            <div className="space-y-3 font-ui text-[var(--verde-palido)] mb-8">
              <p>• <strong className="text-white">Base:</strong> {selections.base}</p>
              <p>• <strong className="text-white">Frescuras:</strong> {selections.frescuras.join(' + ')}</p>
              <p>• <strong className="text-white">Sabores:</strong> {selections.sabores.join(' + ')}</p>
              <p>• <strong className="text-white">Proteína:</strong> {selections.proteina}</p>
              <p>• <strong className="text-white">Salsa:</strong> {selections.salsa}</p>
            </div>
            <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-center">
              <span className="font-ui text-lg">Total a pagar:</span>
              <span className={`font-display font-bold text-3xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-[var(--verde-main)]'}`}>{formatPrice(totalPrice)}</span>
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
              {[1,2,3,4,5].map(i => <div key={i} className={`h-2 rounded-[4px] transition-all duration-300 ${i === step ? 'w-8 bg-[var(--verde-main)]' : 'w-2 bg-white/20'}`} />)}
            </div>
            <Button 
              onClick={() => isStepCompleted && setStep(s => Math.min(6, s + 1))} 
              variant="primary" 
              className={`bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] rounded-[16px] transition-all duration-300 ${!isStepCompleted ? 'opacity-40 cursor-not-allowed hover:translate-y-0' : ''}`}
              disabled={!isStepCompleted}
            >
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

// --- 4. BLOG / HISTORIAS ---
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
             <Button onClick={() => {navigate('cuenta'); window.scrollTo(0,0);}} className="mx-auto rounded-[16px] bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)]">
               <Sparkles size={18}/> Hablar con Asesor Nutricional
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. UBICACIONES ---
const UbicacionesView = () => {
  const [localSeleccionado, setLocalSeleccionado] = useState(LOCALES[0]);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabecera Editorial */}
        <div className="text-center mb-16 animate-in">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Nuestros Espacios</span>
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Ubicaciones</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)] max-w-lg mx-auto">Encuéntranos en los puntos estratégicos de Bogotá y vive la experiencia real en persona.</p>
        </div>

        {/* Layout de Locaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tarjetas de Selección a la Izquierda (5 columnas) */}
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

          {/* Tarjeta de Detalle del Local Activo con Mapa a la Derecha (7 columnas) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-[var(--verde-palido)] p-6 md:p-8 flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[var(--verde-menta)] text-[var(--verde-main)] px-3 py-1 rounded-full text-xs font-bold font-ui uppercase tracking-wide">
                    <Clock size={12}/> Abierto Hoy
                  </span>
                  <h2 className="font-display font-bold text-3xl text-[var(--verde-profundo)] mt-2">{localSeleccionado.nombre}</h2>
                </div>
                <Button 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(localSeleccionado.direccion)}`, '_blank')}
                  className="bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white w-full md:w-auto"
                >
                  Cómo llegar <Navigation size={14}/>
                </Button>
              </div>

              {/* Horarios Estilizados */}
              <div className="grid grid-cols-2 gap-4 bg-[var(--fondo-crema)] p-4 rounded-[16px] border border-[var(--verde-palido)]/30">
                <div className="border-r border-gray-200/60 pr-4">
                  <p className="font-ui text-xs text-[var(--texto-suave)] uppercase font-bold tracking-wider mb-1">Lunes a Viernes</p>
                  <p className="font-ui font-semibold text-sm text-[var(--verde-profundo)]">{localSeleccionado.horarioSemana}</p>
                </div>
                <div className="pl-4">
                  <p className="font-ui text-xs text-[var(--texto-suave)] uppercase font-bold tracking-wider mb-1">Sábados y Domingos</p>
                  <p className="font-ui font-semibold text-sm text-[var(--verde-profundo)]">{localSeleccionado.horarioFinde}</p>
                </div>
              </div>

              {/* Contenedor del Mapa */}
              <div className="rounded-[20px] overflow-hidden h-[300px] border border-gray-100 shadow-inner bg-gray-100">
                <iframe 
                  src={localSeleccionado.mapaUrl} 
                  width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy">
                </iframe>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- 6. MI CUENTA / IA CHATBOT ---
const CuentaView = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '¡Hola, Juan! Soy Origen AI, tu asesor nutricional personal de ORIGEN. Dime, ¿cuáles son tus objetivos hoy o qué tipo de bowl estás buscando?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Cargar puntos de localStorage
  const [puntos, setPuntos] = useState(() => {
    const guardado = localStorage.getItem('origen_puntos');
    return guardado ? parseInt(guardado, 10) : 240;
  });

  useEffect(() => {
    localStorage.setItem('origen_puntos', puntos.toString());
  }, [puntos]);

  const handleSuggestion = (prompt) => {
    setInputVal(prompt);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg = inputVal;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputVal('');
    setIsTyping(true);

    // Simular respuesta inteligente basada en palabras clave
    setTimeout(() => {
      let aiText = "Me encanta tu elección. Para ese objetivo, te sugiero crear un bowl personalizado en 'Arma tu Bowl' usando Quinoa como base, Pechuga de Pollo doble como proteína y aderezado con nuestro Pesto Natural. ¡Es una bomba nutritiva!";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('proteína') || lower.includes('entreno')) {
        aiText = "¡Excelente! Para ganar músculo o post-entreno, el *ORIGEN MÁXIMO* es ideal. Tiene doble proteína de pollo y arroz integral. Si prefieres personalizarlo, no olvides agregar garbanzos y semillas de calabaza.";
      } else if (lower.includes('dulce') || lower.includes('miel')) {
        aiText = "Si tienes antojo de algo dulce y balanceado, te recomiendo el *ORIGEN DULCE*. El lomo con aderezo de miel y mostaza, junto con trozos de mango y manzana fresca, te darán esa explosión dulce sin remordimientos.";
      } else if (lower.includes('sin gluten') || lower.includes('gluten')) {
        aiText = "Tenemos excelentes opciones Gluten-Free. El *ORIGEN TIERRA* (con salmón premium) o el *ORIGEN AGUA* (con atún) son perfectos y están certificados como libres de gluten. ¡Te van a fascinar!";
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-[var(--verde-palido)] animate-in">
          
          <div className="flex items-center gap-6 mb-12 border-b border-[var(--verde-palido)] pb-10">
            <div className="w-24 h-24 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center text-[var(--verde-main)] font-display text-4xl font-bold">JN</div>
            <div>
              <h2 className="font-display font-bold text-4xl text-[var(--verde-profundo)] mb-2">Hola, Juan.</h2>
              <div className="inline-flex items-center gap-2 bg-[var(--dorado-suave)]/20 text-[var(--dorado-fuerte)] px-4 py-1.5 rounded-[8px] font-ui font-bold text-sm">
                <Award size={16}/> {puntos} Puntos Origen
              </div>
            </div>
          </div>

          {/* CHATBOT CONTENEDOR */}
          <div className="bg-[var(--verde-profundo)] rounded-[24px] p-6 text-white relative overflow-hidden flex flex-col min-h-[450px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--verde-main)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            
            {/* Cabecera del Chat */}
            <div className="relative z-10 flex items-center gap-2 pb-4 border-b border-white/10 mb-4 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[var(--verde-main)] animate-pulse"></span>
              <p className="font-ui text-xs font-bold uppercase tracking-widest text-[var(--verde-palido)]">Asesor Nutricional AI</p>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[260px] scrollbar-hide">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3.5 rounded-[16px] font-ui text-sm max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-[var(--verde-main)] text-white rounded-tr-none' : 'bg-white/10 text-[var(--verde-menta)] rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-white/50 text-xs font-ui pl-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  <span>Origen AI está analizando...</span>
                </div>
              )}
            </div>

            {/* Sugerencias rápidas */}
            <div className="flex flex-wrap gap-2 mb-4 shrink-0 relative z-10">
              {['Alto en proteína', 'Antojo de algo dulce', 'Opciones sin gluten'].map(t => (
                <button 
                  key={t} 
                  onClick={() => handleSuggestion(t)}
                  className="bg-white/10 hover:bg-white/20 active:bg-white/35 cursor-pointer px-3 py-1.5 rounded-[8px] text-[11px] font-ui border border-white/10 transition-all text-[var(--verde-palido)]"
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex gap-2 bg-white/5 p-2 rounded-[16px] border border-white/10 focus-within:border-[var(--verde-main)] transition-all shrink-0 relative z-10">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta o escribe tu antojo..." 
                className="flex-1 bg-transparent border-none px-4 font-ui text-sm focus:outline-none text-white placeholder-white/40"
              />
              <button 
                onClick={handleSend}
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


/* =========================================================================
   APP PRINCIPAL (CON LOGO CENTRADO Y MENÚ DE ACCESO LATERAL DESKTOP)
   ========================================================================= */

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Estado para el Modal de Pedidos
  const [pedidoActivo, setPedidoActivo] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenOrderModal = (pedido) => {
    setPedidoActivo(pedido);
  };

  const handleConfirmOrder = (modalidad) => {
    if (pedidoActivo) {
      // Registrar puntos (Le sumamos 50 puntos cada vez que hace un pedido)
      const puntosActuales = localStorage.getItem('origen_puntos') ? parseInt(localStorage.getItem('origen_puntos'), 10) : 240;
      localStorage.setItem('origen_puntos', (puntosActuales + 50).toString());

      generarMensajeWhatsApp({ ...pedidoActivo, modalidad });
    }
    setPedidoActivo(null);
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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root {
          --verde-profundo: #05190C; --verde-bosque: #0D2818; --verde-main: #12B362;
          --verde-vivo: #1EAD61; --verde-brillante: #3EE087; --verde-palido: #C8F0DC;
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
        
        /* Animación premium de respiración glow para la tarjeta Máximo */
        .card-maximo {
          animation: glowRespiration 3s infinite alternate ease-in-out;
        }
        @keyframes glowRespiration {
          0% { box-shadow: 0 4px 20px rgba(240, 144, 48, 0.15); border-color: rgba(240, 144, 48, 0.4); }
          100% { box-shadow: 0 10px 40px rgba(240, 144, 48, 0.35); border-color: rgba(240, 144, 48, 0.9); }
        }
      `}} />

      {/* --- NAVBAR REDISEÑADO CON LOGO EN LA MITAD --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || activeTab !== 'inicio' ? 'bg-[#05190C]/95 backdrop-blur-xl border-b border-white/10 py-4 shadow-sm' : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-16">
          
          {/* LADO IZQUIERDO: Submenú (Hamburguesa en desktop y celular) */}
          <div className="flex items-center z-10">
            <button 
              onClick={() => setIsDrawerOpen(true)} 
              className="text-white hover:text-[var(--verde-main)] transition-colors flex items-center gap-3 group animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[var(--verde-main)] transition-all">
                <MenuIcon size={20} className="text-white" />
              </div>
              <span className="hidden sm:inline font-ui text-xs font-bold tracking-widest text-white uppercase group-hover:text-[var(--verde-main)] transition-all">Explorar</span>
            </button>
          </div>

          {/* CENTRO: Logo ORIGEN alineado perfectamente */}
          <div 
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10" 
            onClick={() => { setActiveTab('inicio'); setIsDrawerOpen(false); }}
          >
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-[0.25em] text-white leading-none">ORIGEN</h1>
            <span className="font-ui text-[8px] md:text-[9px] text-[var(--verde-main)] uppercase tracking-[0.2em] mt-1 font-bold">Comida Saludable</span>
          </div>

          {/* LADO DERECHO: Cuenta + Botón de Acción Rápida con el Verde de tu Imagen */}
          <div className="flex items-center gap-4 z-10">
            <button onClick={() => { setActiveTab('cuenta'); setIsDrawerOpen(false); }} className="text-white hover:text-[var(--verde-main)] transition-colors w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User size={18}/>
            </button>
            <Button 
              onClick={() => { setActiveTab('builder'); setIsDrawerOpen(false); }} 
              variant="primary" 
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] shadow-md border-0 transition-all duration-300 transform hover:-translate-y-0.5 tracking-wider"
            >
              Pedir Ahora
            </Button>
          </div>
        </div>
      </nav>

      {/* --- SUBMENÚ DESLIZANTE DESDE LA IZQUIERDA (SIDE DRAWER) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Fondo opaco del Drawer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
            />
            {/* Contenedor del menú */}
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
                    <span className="font-display font-bold text-xl text-white tracking-widest">ORIGEN</span>
                    <span className="font-ui text-[8px] text-[var(--verde-main)] uppercase tracking-[0.2em] font-bold">Navegación</span>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)} 
                    className="text-white hover:text-[var(--verde-main)] bg-white/10 p-2.5 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-8 mt-12">
                  {NAV_LINKS.map(link => (
                    <button 
                      key={link.id} 
                      onClick={() => { setActiveTab(link.id); setIsDrawerOpen(false); }}
                      className="text-left font-display italic text-3xl sm:text-4xl transition-all hover:translate-x-2 duration-300 flex items-center justify-between group"
                    >
                      <span className={activeTab === link.id ? 'text-[var(--verde-main)]' : 'text-white group-hover:text-[var(--verde-palido)]'}>
                        {link.label}
                      </span>
                      <ArrowRight size={20} className={`text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--verde-main)] transition-all`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer de Acceso Rápido */}
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
          {activeTab === 'menu' && <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CartaView onOrderRequest={handleOpenOrderModal}/></motion.div>}
          {activeTab === 'builder' && <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BuilderView onOrderRequest={handleOpenOrderModal}/></motion.div>}
          {activeTab === 'blog' && <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><BlogView navigate={setActiveTab}/></motion.div>}
          {activeTab === 'ubicaciones' && <motion.div key="ubicaciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><UbicacionesView/></motion.div>}
          {activeTab === 'cuenta' && <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{duration:0.4}}><CuentaView/></motion.div>}
        </AnimatePresence>
      </main>

      {/* --- MODAL DE OPCIONES DE PEDIDO --- */}
      <OrderModal 
        pedido={pedidoActivo} 
        onClose={() => setPedidoActivo(null)} 
        onConfirm={handleConfirmOrder} 
      />

      {/* --- GLOBAL FOOTER --- */}
      <Footer navigate={setActiveTab} />

    </div>
  );
}
