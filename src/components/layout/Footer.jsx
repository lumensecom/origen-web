import { Instagram, MessageCircle, ArrowRight } from 'lucide-react';
import { MR_SIVO_URL } from '../../constants/media';

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.33 6.33 6.34 6.34 0 006.33 6.33 6.34 6.34 0 006.33-6.33V8.7a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Footer = ({ navigate }) => {
  const handleNav = (id) => {
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (msg = '') => {
    window.open(`https://wa.me/573014176911${msg ? `?text=${encodeURIComponent(msg)}` : ''}`, '_blank');
  };

  return (
    <footer className="w-full bg-[#050505] pt-20 pb-12 border-t border-white/5 text-white relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={MR_SIVO_URL} alt="Mr. Sivo" className="h-12 w-auto object-contain drop-shadow-md" />
            <h2 className="font-logo text-3xl tracking-wide">ORIGEN</h2>
          </div>
          <p className="font-ui text-white/50 text-sm mb-6 max-w-sm">
            Comida saludable, rápida y de verdad. Preparada al instante para nutrir tu cuerpo sin aburrir tu paladar.
          </p>
          <div className="flex gap-4 flex-wrap mb-5">
            {[
              { icon: <Instagram size={18}/>, label: 'Instagram', href: 'https://instagram.com/origencomida' },
              { icon: <TikTokIcon size={18}/>, label: 'TikTok', href: 'https://tiktok.com/@origencomida' },
              { icon: <WhatsAppIcon size={18}/>, label: 'WhatsApp', href: 'https://wa.me/573014176911' },
            ].map(({ icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--terracota-vivo)] hover:text-[var(--verde-profundo)] transition-colors text-white">{icon}</div>
                <span className="font-ui text-[9px] text-white/35 group-hover:text-white/60 transition-colors uppercase tracking-wider">{label}</span>
              </a>
            ))}
          </div>
          {/* TODO: reemplazar href por la URL real del perfil de Google Business de ORIGEN */}
          <a href="#google-review-pendiente" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[14px] px-4 py-3 transition-all group w-full max-w-[220px]">
            <span className="text-xl">⭐</span>
            <div className="flex-1 min-w-0">
              <p className="font-ui text-xs font-bold text-white leading-none mb-0.5">Califícanos en Google</p>
              <p className="font-ui text-[10px] text-white/35 leading-none">Tu opinión nos ayuda</p>
            </div>
            <ArrowRight size={13} className="text-white/25 group-hover:text-white/60 shrink-0 transition-colors" />
          </a>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Explorar</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('menu')} className="hover:text-[var(--verde-main)] transition-colors">Carta Origen</button></li>
            <li><button onClick={() => handleNav('builder')} className="hover:text-[var(--verde-main)] transition-colors">Crea tu Origen</button></li>
            <li><button onClick={() => handleNav('blog')} className="hover:text-[var(--verde-main)] transition-colors">Historias / Blog</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">Visítanos</h4>
          <ul className="space-y-4 font-ui text-sm text-white/50">
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-main)] transition-colors">Locales Bogotá</button></li>
            <li><button onClick={() => handleNav('ubicaciones')} className="hover:text-[var(--verde-main)] transition-colors">Horarios de Atención</button></li>
            <li><button onClick={() => handleNav('cuenta')} className="hover:text-[var(--verde-main)] transition-colors">Mi Cuenta / Puntos</button></li>
            <li><button onClick={() => handleNav('pqr')} className="hover:text-[var(--terracota-vivo)] transition-colors">PQR</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui font-bold text-lg mb-6 text-white">¿Dudas o Sugerencias?</h4>
          <p className="font-ui text-sm text-white/50 mb-4">Escríbenos por WhatsApp, leemos todo.</p>
          <button
            onClick={() => openWhatsApp()}
            className="w-full bg-white text-black hover:bg-[var(--verde-main)] hover:text-white rounded-[16px] px-6 py-3 font-ui font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mb-3"
          >
            <MessageCircle size={18} /> Contactar Soporte
          </button>
          <button
            onClick={() => handleNav('pqr')}
            className="w-full border border-white/15 text-white/60 hover:border-[var(--terracota-vivo)] hover:text-[var(--terracota-vivo)] rounded-[16px] px-6 py-3 font-ui font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            📋 Quejas y Sugerencias (PQR)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-ui text-xs text-white/40">© 2026 ORIGEN. Todos los derechos reservados.</p>
        <div className="flex gap-6 font-ui text-xs text-white/40">
          <button className="hover:text-white transition-colors">Términos y Condiciones</button>
          <button className="hover:text-white transition-colors">Políticas de Privacidad</button>
          <button onClick={() => handleNav('pqr')} className="hover:text-[var(--terracota-vivo)] transition-colors">PQR</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
