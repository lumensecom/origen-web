import { Instagram, Facebook, MessageCircle, ArrowRight } from 'lucide-react';

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.33 6.33 6.34 6.34 0 006.33 6.33 6.34 6.34 0 006.33-6.33V8.7a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z"/>
  </svg>
);

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
          <p className="font-ui text-white/50 text-sm mb-6 max-w-sm">
            Comida saludable, rápida y de verdad. Preparada al instante para nutrir tu cuerpo sin aburrir tu paladar.
          </p>
          <div className="flex gap-4 flex-wrap mb-5">
            {[
              { icon: <Instagram size={18}/>, label: 'Instagram', href: 'https://instagram.com' },
              { icon: <Facebook size={18}/>, label: 'Facebook', href: 'https://facebook.com' },
              { icon: <TikTokIcon size={18}/>, label: 'TikTok', href: 'https://tiktok.com' },
            ].map(({ icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--terracota-vivo)] hover:text-[var(--verde-profundo)] transition-colors text-white">{icon}</div>
                <span className="font-ui text-[9px] text-white/35 group-hover:text-white/60 transition-colors uppercase tracking-wider">{label}</span>
              </a>
            ))}
          </div>
          <a href="#google-review" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[14px] px-4 py-3 transition-all group w-full max-w-[220px]">
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
            <MessageCircle size={18} /> Contactar Soporte
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

export default Footer;
