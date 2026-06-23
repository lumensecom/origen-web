import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.33 6.33 6.34 6.34 0 006.33 6.33 6.34 6.34 0 006.33-6.33V8.7a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z"/>
  </svg>
);

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'menu', label: 'Carta Origen' },
  { id: 'builder', label: 'Arma tu Bowl' },
  { id: 'blog', label: 'Historias / Blog' },
  { id: 'ubicaciones', label: 'Ubicaciones' },
];

const SideDrawer = ({ isOpen, activeTab, onNavigate, onClose }) => {
  const { isSeller, isAdmin, isStaff, isAuthenticated } = useAuth();

  // Order history is for logged-in customers only (staff have no purchase
  // history); staff get their Caja / Panel entries instead.
  const links = [
    ...NAV_LINKS,
    ...(isAuthenticated && !isStaff ? [{ id: 'historial', label: 'Historial de pedidos' }] : []),
    ...(isSeller ? [{ id: 'seller', label: 'Caja / Escáner', staff: true }] : []),
    ...(isAdmin ? [{ id: 'admin', label: 'Panel de Ventas', staff: true }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-md bg-[#1C2E22] border-r border-white/10 z-[160] p-8 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex justify-between items-center pb-8 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="font-logo text-xl text-white tracking-wide">ORIGEN</span>
                  <span className="font-ui text-[8px] text-[var(--terracota-vivo)] uppercase tracking-[0.2em] font-bold">Navegación</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-[var(--terracota-vivo)] bg-white/10 p-2.5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-8 mt-12">
                {links.map(link => (
                  <button
                    key={link.id}
                    onClick={() => { onNavigate(link.id); onClose(); }}
                    className="text-left font-display italic text-3xl sm:text-4xl transition-all hover:translate-x-2 duration-300 flex items-center justify-between group"
                  >
                    <span className={`flex items-center gap-3 ${activeTab === link.id ? 'text-[var(--terracota-vivo)]' : 'text-white group-hover:text-[var(--verde-palido)]'}`}>
                      {link.label}
                      {link.staff && <span className="font-ui not-italic text-[9px] font-bold uppercase tracking-widest bg-[var(--verde-main)]/20 text-[var(--verde-main)] px-2 py-1 rounded-full">Staff</span>}
                    </span>
                    <ArrowRight size={20} className="text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[var(--terracota-vivo)] transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col gap-6">
              <div className="flex gap-4">
                {[
                  { icon: <Instagram size={18}/>, label: 'Instagram' },
                  { icon: <Facebook size={18}/>, label: 'Facebook' },
                  { icon: <TikTokIcon size={18}/>, label: 'TikTok' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 group">
                    <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracota-vivo)] hover:text-[var(--verde-profundo)] transition-colors text-white">{icon}</button>
                    <span className="font-ui text-[9px] text-white/35 group-hover:text-white/60 transition-colors uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
              <div className="font-ui text-xs text-white/50">
                Bogotá, Colombia • Comida saludable
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
