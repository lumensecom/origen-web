import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Check, RotateCcw, Pencil, CreditCard, MapPin, Clock,
  Loader2, ShieldAlert, ArrowRight, Hash, Package,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderById, setOrderDelivered } from '../../lib/database';
import { formatPrice } from '../../utils/format';
import QRScanner from '../../components/seller/QRScanner';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const extractUuid = (text) => text.match(UUID_RE)?.[0] ?? text;

const GateCard = ({ icon, title, body, action }) => (
  <div className="pt-32 pb-32 min-h-screen w-full">
    <div className="max-w-md mx-auto px-6">
      <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-[var(--verde-palido)]">
        <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center mx-auto mb-6">{icon}</div>
        <h2 className="font-display italic text-3xl text-[var(--verde-profundo)] mb-3">{title}</h2>
        <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">{body}</p>
        {action}
      </div>
    </div>
  </div>
);

const SellerView = ({ resumeOrder, onConsumeResume, onEditOrder, onRequireAuth }) => {
  const { isAuthenticated, isSeller, sellerLocation } = useAuth();
  const [view, setView] = useState('scan'); // scan | loading | order | paid
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [processing, setProcessing] = useState(false);

  // When returning from the builder after a seller edit, resume on the order.
  useEffect(() => {
    if (resumeOrder) {
      setOrder(resumeOrder);
      setView('order');
      onConsumeResume?.();
    }
  }, [resumeOrder, onConsumeResume]);

  const loadOrder = async (id) => {
    setError('');
    setView('loading');
    try {
      const o = await getOrderById(id);
      setOrder(o);
      setView('order');
    } catch {
      setError('No encontramos un pedido con ese código.');
      setView('scan');
    }
  };

  const handleScan = (text) => loadOrder(extractUuid(text));

  const handlePagar = async () => {
    setProcessing(true);
    setError('');
    try {
      const updated = await setOrderDelivered(order.id, true);
      setOrder(updated ?? { ...order, entregado: true });
      setView('paid');
    } catch (e) {
      setError(e?.message || 'No se pudo registrar el pago.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUndo = async () => {
    setProcessing(true);
    try {
      const updated = await setOrderDelivered(order.id, false);
      setOrder(updated ?? { ...order, entregado: false });
      setView('order');
      setToast('Pago revertido — el pedido vuelve a estar pendiente.');
      setTimeout(() => setToast(''), 3500);
    } catch (e) {
      setError(e?.message || 'No se pudo deshacer.');
    } finally {
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setOrder(null);
    setError('');
    setView('scan');
  };

  // ---------- Role gates ----------
  if (!isAuthenticated) {
    return (
      <GateCard
        icon={<ShieldAlert size={36} className="text-[var(--verde-main)]" />}
        title="Acceso de caja"
        body="Inicia sesión con la cuenta del local para usar el escáner de pedidos."
        action={
          <button onClick={onRequireAuth} className="bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 px-8 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all inline-flex items-center gap-2">
            Iniciar sesión <ArrowRight size={16} />
          </button>
        }
      />
    );
  }
  if (!isSeller) {
    return (
      <GateCard
        icon={<ShieldAlert size={36} className="text-red-400" />}
        title="Módulo exclusivo de caja"
        body="Esta sección es solo para cuentas de personal (seller). Si crees que es un error, contacta al administrador."
        action={null}
      />
    );
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  const hasBuilderBowl = items.some(it => it.esBuilder);
  const shortId = order ? String(order.id).slice(0, 8).toUpperCase() : '';

  return (
    <div className="pt-28 pb-32 min-h-screen w-full">
      <div className="max-w-md mx-auto px-6">

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full font-ui text-xs font-bold uppercase tracking-wider mb-3">
            <ScanLine size={14} /> Caja Origen
          </span>
          <h1 className="font-display italic text-4xl text-[var(--verde-profundo)]">Escáner de pedidos</h1>
          {sellerLocation && <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">{sellerLocation}</p>}
        </div>

        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-[var(--verde-profundo)] text-white font-ui text-sm px-4 py-3 rounded-[14px] text-center">
            {toast}
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* ---------- SCAN ---------- */}
          {view === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <QRScanner onScan={handleScan} onError={() => {}} />
              <p className="text-center font-ui text-sm text-[var(--texto-suave)]">Apunta la cámara al código QR del cliente.</p>

              {error && <p className="font-ui text-sm text-red-500 text-center">{error}</p>}

              <div className="bg-white rounded-[18px] border border-[var(--verde-palido)] p-4">
                <label className="font-ui text-[10px] font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">¿La cámara falla? Ingresa el código del pedido</label>
                <ManualEntry onSubmit={handleScan} />
              </div>
            </motion.div>
          )}

          {/* ---------- LOADING ---------- */}
          {view === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[24px] border border-[var(--verde-palido)] p-12 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[var(--verde-main)]" />
              <p className="font-ui text-sm text-[var(--texto-suave)]">Buscando pedido…</p>
            </motion.div>
          )}

          {/* ---------- ORDER ---------- */}
          {view === 'order' && order && (
            <motion.div key="order" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-[24px] border border-[var(--verde-palido)] shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 font-display font-bold text-2xl text-[var(--verde-profundo)] tracking-wider"><Hash size={18} className="text-[var(--texto-suave)]" />{shortId}</span>
                  {order.entregado
                    ? <span className="font-ui text-xs font-bold bg-[var(--verde-menta)] text-[var(--verde-main)] px-3 py-1.5 rounded-full">Pagado</span>
                    : <span className="font-ui text-xs font-bold bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-3 py-1.5 rounded-full">Pendiente</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-ui text-xs text-[var(--texto-suave)]">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} />{order.store_location || order.delivery_type || 'En local'}</span>
                  {order.created_at && <span className="inline-flex items-center gap-1"><Clock size={12} />{new Date(order.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                </div>
              </div>

              <div className="px-6 py-4 space-y-3 max-h-[40vh] overflow-y-auto scrollbar-hide">
                {items.map((it, i) => (
                  <div key={`${it.id ?? i}`} className="flex items-start gap-3">
                    <span className="font-display font-bold text-[var(--verde-main)] text-sm w-7 flex-shrink-0">{it.quantity}×</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">{it.nombre}</p>
                      {it.esBuilder && (
                        <p className="font-ui text-[11px] text-[var(--texto-suave)] leading-relaxed">
                          {[it.base, it.proteina, it.salsa].filter(Boolean).join(' · ')}
                          {Array.isArray(it.frescuras) && it.frescuras.length > 0 && ` · ${it.frescuras.join(', ')}`}
                        </p>
                      )}
                    </div>
                    <span className="font-ui text-sm text-[var(--texto-suave)] flex-shrink-0">{formatPrice((it.precio ?? 0) * (it.quantity ?? 1))}</span>
                  </div>
                ))}
                {items.length === 0 && <p className="font-ui text-sm text-[var(--texto-suave)] flex items-center gap-2"><Package size={14} /> Pedido sin artículos.</p>}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-ui text-sm text-[var(--texto-suave)]">Total</span>
                <span className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{formatPrice(order.total_price)}</span>
              </div>

              {error && <p className="px-6 pb-2 font-ui text-sm text-red-500 text-center">{error}</p>}

              <div className="px-6 pb-6 pt-2 space-y-2.5">
                {!order.entregado ? (
                  <button onClick={handlePagar} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-60">
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />} Pagar
                  </button>
                ) : (
                  <button onClick={handleUndo} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[var(--verde-profundo)] text-[var(--verde-profundo)] font-ui font-bold py-4 rounded-[16px] hover:bg-[var(--fondo-crema)] transition-all active:scale-[0.98] disabled:opacity-60">
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />} Deshacer pago
                  </button>
                )}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => onEditOrder?.(order)}
                    disabled={!hasBuilderBowl || order.entregado}
                    title={!hasBuilderBowl ? 'Este pedido no tiene bowls personalizados' : ''}
                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--fondo-crema)] text-[var(--verde-profundo)] font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-menta)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Pencil size={16} /> Editar pedido
                  </button>
                  <button onClick={resetScan} className="px-5 flex items-center justify-center gap-2 text-[var(--texto-suave)] font-ui font-semibold text-sm hover:text-[var(--verde-profundo)] border border-[var(--verde-palido)] rounded-[16px] transition-colors">
                    <ScanLine size={16} /> Otro
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------- PAID ---------- */}
          {view === 'paid' && order && (
            <motion.div key="paid" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[24px] border border-[var(--verde-palido)] shadow-sm p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }} className="w-20 h-20 bg-[var(--verde-main)] rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={40} className="text-white" />
              </motion.div>
              <h2 className="font-display font-bold text-3xl text-[var(--verde-profundo)] mb-1">¡Pago registrado!</h2>
              <p className="font-ui text-sm text-[var(--texto-suave)] mb-1">Pedido #{shortId} marcado como entregado.</p>
              <p className="font-display font-bold text-2xl text-[var(--verde-main)] mb-6">{formatPrice(order.total_price)}</p>

              {error && <p className="font-ui text-sm text-red-500 mb-3">{error}</p>}

              <div className="space-y-2.5">
                <button onClick={resetScan} className="w-full flex items-center justify-center gap-2 bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all active:scale-[0.98]">
                  <ScanLine size={18} /> Escanear nuevo QR
                </button>
                <button onClick={handleUndo} disabled={processing} className="w-full flex items-center justify-center gap-2 text-[var(--texto-suave)] font-ui font-semibold text-sm py-3 hover:text-red-500 transition-colors disabled:opacity-60">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Deshacer (fue un error)
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

// Small controlled input for manual order-code entry (camera fallback).
const ManualEntry = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (code.trim()) onSubmit(code.trim()); }}
      className="flex gap-2"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Pega el ID del pedido"
        className="flex-1 min-w-0 px-3 py-2.5 rounded-[12px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
      />
      <button type="submit" className="px-4 bg-[var(--verde-profundo)] text-white rounded-[12px] font-ui text-sm font-bold hover:bg-[var(--verde-bosque)] transition-colors">Buscar</button>
    </form>
  );
};

export default SellerView;
