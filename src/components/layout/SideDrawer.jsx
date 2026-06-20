import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'menu', label: 'Carta Origen' },
  { id: 'builder', label: 'Arma tu Bowl' },
  { id: 'blog', label: 'Historias / Blog' },
  { id: 'ubicaciones', label: 'Ubicaciones' },
];

const SideDrawer = ({ isOpen, activeTab, onNavigate, onClose }) => {
  const { isSeller, isAdmin } = useAuth();

  // Staff-only entries appear for seller/admin accounts.
  const links = [
    ...NAV_LINKS,
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
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracota-vivo)] hover:text-[var(--verde-profundo)] transition-colors text-white">
                  <Instagram size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracota-vivo)] hover:text-[var(--verde-profundo)] transition-colors text-white">
                  <Facebook size={18} />
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
  );
};

export default SideDrawer;
