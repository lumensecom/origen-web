import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../components/ui/animations';

const PQR_MSG = 'Hola ORIGEN, quiero compartir una sugerencia/queja: ';
const WA_NUMBER = '573014176911';

export default function PQRView() {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(PQR_MSG)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--fondo-crema)] pt-28 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center mb-12">
          <motion.span variants={fadeUp} className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracota-quemado)] mb-4 block">
            Peticiones · Quejas · Reclamos
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mb-4 leading-tight">
            ¿Tienes una queja<br />o sugerencia?
          </motion.h1>
          <motion.p variants={fadeUp} className="font-ui text-lg text-[var(--texto-suave)] max-w-md mx-auto leading-relaxed">
            Escríbenos directamente, leemos todo. Tu opinión nos ayuda a mejorar cada bowl.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          {/* Main CTA */}
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] border border-[var(--verde-palido)] shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <MessageCircle size={28} className="text-[#25D366]" />
            </div>
            <h2 className="font-display italic text-2xl text-[var(--verde-profundo)] mb-2">WhatsApp directo</h2>
            <p className="font-ui text-sm text-[var(--texto-suave)] mb-6 max-w-xs mx-auto">
              Escribe tu mensaje y te atendemos personalmente. Tiempo de respuesta: menos de 24 horas.
            </p>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-ui font-bold text-base px-8 py-4 rounded-[20px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <MessageCircle size={20} />
              Enviar PQR por WhatsApp
              <ArrowRight size={18} />
            </button>
            <p className="font-ui text-xs text-[var(--texto-suave)] mt-4 opacity-60">+57 301 417 6911</p>
          </motion.div>

          {/* Types of PQR */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '📋', label: 'Petición', desc: 'Solicita información o un servicio específico' },
              { emoji: '😕', label: 'Queja', desc: 'Cuéntanos si algo no estuvo bien' },
              { emoji: '💡', label: 'Sugerencia', desc: 'Comparte tus ideas para mejorar' },
            ].map(({ emoji, label, desc }) => (
              <button key={label} onClick={openWhatsApp} className="bg-white rounded-[20px] border border-[var(--verde-palido)] p-5 text-left hover:border-[var(--verde-main)] hover:shadow-md transition-all group">
                <span className="text-2xl block mb-3">{emoji}</span>
                <p className="font-ui font-bold text-sm text-[var(--verde-profundo)] mb-1 group-hover:text-[var(--verde-main)] transition-colors">{label}</p>
                <p className="font-ui text-xs text-[var(--texto-suave)] leading-relaxed">{desc}</p>
              </button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="bg-[var(--verde-profundo)] rounded-[24px] px-6 py-5 flex items-center gap-4">
            <span className="text-2xl shrink-0">🥦</span>
            <div>
              <p className="font-ui font-bold text-sm text-white">Comprometidos con tu experiencia</p>
              <p className="font-ui text-xs text-white/60 mt-0.5 leading-relaxed">
                Cada retroalimentación que recibimos se revisa y se usa para mejorar. Gracias por ayudarnos a crecer.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
