import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { formatPrice } from '../../utils/format';

// Floating, stacked new-order toasts for the Caja (seller). Mounted globally
// in App so the operator is alerted on any tab. Each toast appears once per
// order, auto-dismisses after 12 s, and opens the order in the scanner on click.
// Fed by the global useOrderNotifications hook (sound + vibration happen there).
const AUTO_DISMISS_MS = 12000;

const NotificationToasts = ({ notifications = [], onOpenOrder }) => {
  const [toasts, setToasts] = useState([]);
  const shownRef = useRef(new Set()); // orders already toasted (no re-toast on re-render)
  const timersRef = useRef({});

  // Surface any not-yet-shown notification as a transient toast.
  useEffect(() => {
    notifications.forEach(n => {
      if (shownRef.current.has(n.orderId)) return;
      shownRef.current.add(n.orderId);
      setToasts(prev => [{ ...n }, ...prev]);
      timersRef.current[n.orderId] = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.orderId !== n.orderId));
        delete timersRef.current[n.orderId];
      }, AUTO_DISMISS_MS);
    });
  }, [notifications]);

  useEffect(() => () => { Object.values(timersRef.current).forEach(clearTimeout); }, []);

  const dismiss = (orderId) => {
    clearTimeout(timersRef.current[orderId]);
    delete timersRef.current[orderId];
    setToasts(prev => prev.filter(t => t.orderId !== orderId));
  };

  return (
    <div className="fixed top-24 right-4 z-[300] flex flex-col gap-3 max-w-[300px] w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const count = Array.isArray(t.items) ? t.items.reduce((s, it) => s + (it.quantity ?? 1), 0) : 0;
          return (
            <motion.div
              key={t.orderId}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              onClick={() => { onOpenOrder?.(t.orderId); dismiss(t.orderId); }}
              className="pointer-events-auto cursor-pointer bg-[var(--verde-profundo)] border border-[var(--verde-main)]/40 rounded-[20px] p-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[var(--verde-main)] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bell size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui font-bold text-sm text-white leading-tight">¡Nuevo pedido!</p>
                  <p className="font-ui text-xs text-[var(--verde-palido)] mt-0.5">
                    {count} ítem(s) · {formatPrice(t.total)}
                  </p>
                  <p className="font-ui text-[10px] text-white/40 mt-0.5">
                    #{String(t.orderId).slice(0, 8).toUpperCase()} · {t.ts.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(t.orderId); }}
                  className="text-white/40 hover:text-white transition-colors p-1 flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToasts;
