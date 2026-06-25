import { useState, useRef, useEffect } from 'react';
import { Bell, Package, Clock } from 'lucide-react';
import { formatPrice } from '../../utils/format';

// Navbar bell for the Caja (seller). Sits where the cart would be (the cart is
// hidden for staff). Shows an unread badge and a dropdown of recent new-order
// alerts; clicking one opens that order in the scanner. Driven entirely by the
// global useOrderNotifications hook (state lives in App).
const NotificationBell = ({ notifications = [], unreadCount = 0, onMarkRead, onClear, onOpen }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      if (next && unreadCount > 0) onMarkRead?.(); // opening clears the unread badge
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notificaciones de pedidos"
        className="relative w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-[300px] max-w-[85vw] bg-white rounded-[20px] shadow-2xl border border-[var(--verde-palido)] overflow-hidden z-[120]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[var(--verde-menta)]">
            <span className="font-ui font-bold text-sm text-[var(--verde-profundo)] inline-flex items-center gap-2">
              <Bell size={15} /> Pedidos nuevos
            </span>
            {notifications.length > 0 && (
              <button
                onClick={() => { onClear?.(); setOpen(false); }}
                className="font-ui text-[11px] font-bold text-[var(--texto-suave)] hover:text-red-500 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Package size={24} className="text-[var(--verde-palido)] mx-auto mb-2" />
                <p className="font-ui text-xs text-[var(--texto-suave)]">Sin pedidos nuevos por ahora.</p>
              </div>
            ) : (
              notifications.map(n => {
                const sid = String(n.orderId).slice(0, 8).toUpperCase();
                const count = Array.isArray(n.items) ? n.items.reduce((s, it) => s + (it.quantity ?? 1), 0) : 0;
                return (
                  <button
                    key={n.orderId}
                    onClick={() => { onOpen?.(n.orderId); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[var(--fondo-crema)] transition-colors flex items-center gap-3 ${n.read ? '' : 'bg-[var(--verde-menta)]/40'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--verde-main)] flex items-center justify-center flex-shrink-0">
                      <Bell size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui font-bold text-xs text-[var(--verde-profundo)]">#{sid} · {count} ítem(s)</p>
                      <p className="font-ui text-[10px] text-[var(--texto-suave)] inline-flex items-center gap-1">
                        <Clock size={10} /> {n.ts.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-display font-bold text-sm text-[var(--verde-main)] flex-shrink-0">{formatPrice(n.total)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
