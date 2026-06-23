import { motion } from 'framer-motion';
import { X, Store } from 'lucide-react';
import useLockBodyScroll from '../hooks/useLockBodyScroll';
import { formatPrice } from '../utils/format';
import QRCode from './ui/QRCode';

// Shown after a customer generates the QR for their order. The QR encodes the
// order's UUID; the seller scans it in store to pull up the order and charge it.
const OrderQRModal = ({ order, onClose }) => {
  useLockBodyScroll(true);
  if (!order) return null;

  const shortId = String(order.id).slice(0, 8).toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
          <h2 className="font-display italic text-xl text-[var(--verde-profundo)]">Tu pedido está listo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full font-ui text-xs font-bold mb-5">
            <Store size={14} /> Muéstralo en caja para pagar
          </div>

          <div className="p-4 bg-white rounded-[20px] border border-[var(--verde-palido)] shadow-sm">
            <QRCode value={order.id} size={208} />
          </div>

          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-[var(--texto-suave)] mt-5 mb-1">Pedido</p>
          <p className="font-display font-bold text-2xl text-[var(--verde-profundo)] tracking-wider">#{shortId}</p>

          {items.length > 0 && (
            <div className="w-full mt-5 space-y-1.5 text-left bg-[var(--fondo-crema)] rounded-[16px] p-4">
              {items.map((it, i) => (
                <div key={`${it.id ?? i}`} className="flex items-center justify-between font-ui text-sm">
                  <span className="text-[var(--verde-profundo)] truncate pr-2">{it.quantity}× {it.nombre}</span>
                  <span className="text-[var(--texto-suave)] flex-shrink-0">{formatPrice((it.precio ?? 0) * (it.quantity ?? 1))}</span>
                </div>
              ))}
            </div>
          )}

          <div className="w-full flex items-center justify-between mt-4 mb-6">
            <span className="font-ui text-sm text-[var(--texto-suave)]">Total a pagar</span>
            <span className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{formatPrice(order.total_price)}</span>
          </div>

          <button onClick={onClose} className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all active:scale-[0.98]">
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderQRModal;
