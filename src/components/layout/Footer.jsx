import { Instagram, Facebook, MessageCircle } from 'lucide-react';

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
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors">
              <Instagram size={18} />
            </button>
            <button className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center hover:bg-[var(--verde-main)] hover:text-white transition-colors">
              <Facebook size={18} />
            </button>
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
