import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { REAL_MEDIA } from '../../constants/media';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import Button from '../../components/ui/Button';

const POSTS = [
  {
    id: 'aguacate',
    title: 'El Aguacate Hass Colombiano: El Oro Verde en tu Plato',
    img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800',
    category: 'Nutrición',
    date: 'Mayo 2026',
    readTime: '3 min de lectura',
    subtitle: 'La ciencia detrás de los ácidos grasos saludables y cómo actúan como catalizadores de absorción de vitaminas.',
    content: [
      'El aguacate Hass es, indiscutiblemente, la joya de la corona en cualquier bowl de nuestra carta. Sin embargo, su valor dentro del menú de ORIGEN trasciende lo delicioso y cremoso de su textura. Detrás de esta fruta se esconde un milagro bioquímico de primer nivel.',
      'Nuestro aguacate es seleccionado rigurosamente en granjas familiares de Tolima y Antioquia. A diferencia de otras grasas vegetales altamente procesadas, el Hass se consume en su estado más puro y fresco. Está cargado principalmente de ácido oleico (grasas monoinsaturadas), el cual ayuda a mantener a raya el colesterol LDL (malo) mientras eleva el HDL (bueno).',
      'Pero el verdadero secreto nutricional radica en la sinergia biológica: muchas de las vitaminas presentes en las verduras de tu bowl son liposolubles. Esto significa que tu cuerpo solo puede absorberlas adecuadamente si se consumen acompañadas de una grasa saludable de alta densidad.',
      'Al morder una porción de aguacate junto a tus vegetales crujientes, estás multiplicando hasta por cinco veces la absorción real de micronutrientes y antioxidantes. No es solo comer saludable; es diseñar combinaciones científicamente optimizadas para que tu cuerpo aproveche cada gramo de nutrición real.',
    ],
  },
  {
    id: 'pesca-sostenible',
    title: 'Pesca Sostenible: El Viaje Responsable del Salmón y Atún',
    img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800',
    category: 'Ingredientes',
    date: 'Abril 2026',
    readTime: '5 min de lectura',
    subtitle: 'Trazabilidad completa desde las corrientes frías del Pacífico hasta la frescura del plato en minutos.',
    content: [
      'Asegurar un pescado fresco, tierno, libre de metales pesados y de origen ético en una ciudad de montaña como Bogotá es uno de los mayores desafíos logísticos que asumimos todos los días en ORIGEN.',
      'Para lograrlo, trabajamos exclusivamente bajo certificaciones internacionales ASC (Aquaculture Stewardship Council) y MSC (Marine Stewardship Council). Esto garantiza que el atún que disfrutas en Origen Agua y el salmón fresco en Origen Tierra provienen únicamente de pesquerías y cultivos que respetan los límites biológicos de las especies marinas.',
      'La cadena de frío es implacable: el pescado se limpia, porciona y congela criogénicamente en origen minutos después de la captura. Posteriormente, viaja vía aérea bajo estrictas auditorías térmicas diarias hasta arribar a nuestras cocinas.',
      'Este viaje transparente nos permite servirte filetes magros con niveles óptimos de Omega-3 y grasas poliinsaturadas protectoras del sistema cardiovascular. Sin atajos, sin conservantes químicos artificiales. Solo la pureza intacta del mar en tu plato.',
    ],
  },
  {
    id: 'equipo-mujeres',
    title: 'Las Mujeres Detrás de Cada Bowl: Nuestra Apuesta por la Inclusión',
    img: REAL_MEDIA.staff2,
    gallery: [REAL_MEDIA.staff1, REAL_MEDIA.staff2, REAL_MEDIA.pared1, REAL_MEDIA.pared2],
    category: 'Comunidad',
    date: 'Junio 2026',
    readTime: '3 min de lectura',
    subtitle: 'En ORIGEN creemos que contratar mujeres no es una política de cuotas — es una decisión que hace mejores a los equipos y más justo al mundo.',
    content: [
      'Desde el primer día, en ORIGEN tomamos una decisión que para nosotros es sencilla pero que sigue siendo radical en muchos sectores: preferimos contratar mujeres. No porque sea una tendencia, sino porque creemos profundamente que la inclusión de género en los equipos de trabajo genera ambientes más empáticos, más creativos y más sólidos.',
      'La mayoría de las personas que preparan tus bowls, que cuidan cada ingrediente, que aseguran que cada porción llegue con cariño y precisión, son mujeres colombianas que encontraron en ORIGEN un espacio de trabajo digno, estable y con posibilidades de crecimiento real.',
      'Sabemos que en Colombia el acceso al mercado laboral para las mujeres sigue siendo desigual. Por eso nos importa ser parte activa del cambio. No se trata solo de cumplir con una normativa, sino de construir un tipo de empresa donde el talento femenino sea reconocido, bien remunerado y respetado.',
      'Cuando eliges un bowl de ORIGEN, no solo estás alimentando tu cuerpo con ingredientes reales. Estás siendo parte de un modelo de negocio que cree en las personas — en todas ellas, sin importar su género.',
    ],
  },
];

const BlogView = ({ navigate }) => {
  const [activePost, setActivePost] = useState(null);
  useLockBodyScroll(!!activePost);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[var(--fondo-crema)] w-full relative">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 animate-in">
          <span className="font-ui text-[var(--terracota-quemado)] font-bold tracking-[0.25em] uppercase text-xs mb-4 inline-block">Historias de Origen</span>
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Nuestro Blog</h1>
          <p className="font-ui text-lg text-[var(--texto-suave)] max-w-xl mx-auto">
            Explora las crónicas de los ingredientes, las vidas de nuestros campesinos aliados y el porqué detrás de una nutrición real y honesta.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="font-display italic text-xl md:text-2xl text-[var(--verde-profundo)] leading-relaxed">
            Origen nació en Bogotá con una idea sencilla: <span className="text-[var(--terracota-quemado)]">comer bien no debería ser complicado ni caro.</span> Hoy somos 3 locales, un equipo apasionado y miles de bowls preparados con ingredientes reales, frente a ti, todos los días.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '200ms' }}>
          {POSTS.map(post => (
            <div key={post.id} onClick={() => setActivePost(post)} className="bg-white rounded-[24px] overflow-hidden border border-[var(--verde-palido)] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgba(18,179,98,0.08)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[10px] font-ui text-[10px] uppercase font-bold text-[var(--verde-main)] tracking-wider shadow-sm">{post.category}</div>
                <img loading="lazy" src={post.img} alt={post.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${post.id === 'equipo-mujeres' ? 'object-top' : ''}`} />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-[var(--texto-suave)] font-ui mb-3">
                  <span>{post.date}</span><span>•</span><span>{post.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-3 leading-snug group-hover:text-[var(--verde-main)] transition-colors duration-300">{post.title}</h3>
                <p className="font-ui text-sm text-[var(--texto-suave)] leading-relaxed line-clamp-3 mb-6">{post.subtitle}</p>
                <span className="font-ui text-[var(--terracota-quemado)] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto pt-4 border-t border-gray-50">
                  Leer historia completa <ArrowRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Historia horizontal card */}
        <div className="mt-16 bg-[var(--fondo-crema)] border border-[var(--verde-palido)] rounded-[28px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-[20px] bg-[var(--verde-profundo)] flex items-center justify-center">
            <span className="font-logo text-2xl md:text-3xl text-white tracking-wider">O</span>
          </div>
          <div>
            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--terracota-quemado)] block mb-2">Nuestra Historia</span>
            <p className="font-display italic text-lg md:text-xl text-[var(--verde-profundo)] leading-relaxed">
              Origen nació en Bogotá con una idea sencilla: <span className="text-[var(--terracota-quemado)]">comer bien no debería ser complicado ni caro.</span> Hoy somos 3 locales, un equipo apasionado y miles de bowls preparados con ingredientes reales, frente a ti, todos los días.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-[var(--verde-profundo)] rounded-[32px] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-xl border border-[var(--verde-bosque)]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--verde-main)] rounded-full blur-[120px] opacity-20 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="font-ui text-[var(--terracota-suave)] font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">¿Dudas sobre tu dieta?</span>
            <h2 className="font-display italic text-4xl md:text-5xl mb-6">Tu nutrición es única y personal.</h2>
            <p className="font-ui text-[var(--verde-palido)] mb-8 leading-relaxed text-base md:text-lg">
              Pregúntale a Vita, nuestra asesora nutricional con IA, o agenda un diagnóstico con nuestro equipo para encontrar tu balance idóneo.
            </p>
            <Button onClick={() => { navigate('cuenta'); window.scrollTo(0, 0); }} className="mx-auto rounded-[16px] bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] border-0">
              <Sparkles size={18} /> Hablar con Asesor Nutricional
            </Button>
          </div>
        </div>
      </div>

      {/* Lector de artículo (overlay) */}
      <AnimatePresence>
        {activePost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex justify-end" onClick={() => setActivePost(null)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="bg-[var(--fondo-crema)] w-full max-w-3xl h-screen flex flex-col relative z-20 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[var(--fondo-crema)]">
                <button onClick={() => setActivePost(null)} className="p-2.5 bg-white rounded-full text-gray-500 hover:text-black hover:scale-110 shadow-sm border border-gray-100 transition-all">
                  <X size={20} />
                </button>
                <span className="font-ui text-xs font-bold uppercase tracking-widest text-[var(--verde-main)] bg-[var(--verde-menta)] px-4 py-1.5 rounded-full">{activePost.category}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-16">
                <article className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 text-sm text-[var(--texto-suave)] font-ui mb-4">
                    <span>{activePost.date}</span><span>•</span><span>{activePost.readTime}</span><span>•</span>
                    <span className="font-semibold text-[var(--verde-main)]">Escrito por Origen Editorial</span>
                  </div>
                  <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--verde-profundo)] leading-tight mb-6">{activePost.title}</h1>
                  <p className="font-ui text-lg md:text-xl text-[var(--verde-main)] font-medium leading-relaxed mb-10 pb-6 border-b border-gray-100">{activePost.subtitle}</p>
                  <div className="rounded-[24px] overflow-hidden shadow-md mb-10 aspect-video">
                    <img loading="lazy" src={activePost.img} alt={activePost.title} className={`w-full h-full object-cover ${activePost.id === 'equipo-mujeres' ? 'object-top' : ''}`} />
                  </div>
                  <div className="space-y-6 font-ui text-gray-800 text-base md:text-lg leading-relaxed font-light">
                    {activePost.content.map((paragraph, idx) => (
                      <p key={idx} className="first-letter:font-display first-letter:text-3xl first-letter:font-bold first-letter:text-[var(--verde-main)] first-letter:mr-1">{paragraph}</p>
                    ))}
                  </div>
                  {activePost.gallery && (
                    <div className="grid grid-cols-2 gap-4 mt-10">
                      {activePost.gallery.map((src, idx) => (
                        <div key={idx} className="rounded-[20px] overflow-hidden shadow-md aspect-[3/4]">
                          <img loading="lazy" src={src} alt={`${activePost.title} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--verde-main)] text-white font-display font-bold text-lg rounded-full flex items-center justify-center">O</div>
                      <div>
                        <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">Comité de Nutrición & Impacto</p>
                        <p className="font-ui text-xs text-[var(--texto-suave)]">ORIGEN Alimentación Consciente</p>
                      </div>
                    </div>
                    <button onClick={() => { setActivePost(null); navigate('menu'); }} className="font-ui font-bold text-sm text-[var(--verde-main)] hover:text-[var(--verde-profundo)] flex items-center gap-2 transition-all group">
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

export default BlogView;
