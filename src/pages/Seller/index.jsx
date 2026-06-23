import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Check, RotateCcw, Pencil, CreditCard, MapPin, Clock,
  Loader2, ShieldAlert, ArrowRight, Hash, Package, History, RefreshCw, Bell, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { sellerSearchOrder, sellerListOrders, setOrderDelivered } from '../../lib/database';
import { formatPrice } from '../../utils/format';
import QRScanner from '../../components/seller/QRScanner';

// Plays a soft two-tone chime using the Web Audio API (no audio file needed).
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const play = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    play(880, 0, 0.18);
    play(1100, 0.2, 0.22);
  } catch { /* audio blocked */ }
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
// Pull a UUID out of the scanned payload if present; otherwise return the raw
// text so manual short codes (#XXXXXXXX) flow through. The "#" and dashes are
// sanitised by sellerSearchOrder / the RPC, so a 400 from `id=eq.#…` is gone.
const extractCode = (text) => String(text ?? '').match(UUID_RE)?.[0] ?? String(text ?? '').trim();

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
  const { isAuthenticated, isSeller, sellerLocation, sellerLocalId } = useAuth();
  const [mode, setMode] = useState('scanner');  // scanner | history
  const [view, setView] = useState('scan');     // scan | loading | order | paid
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [processing, setProcessing] = useState(false);
  const [newOrderAlerts, setNewOrderAlerts] = useState([]); // [{id, nombre, total, ts}]
  const alertTimers = useRef({});

  // When returning from the builder after a seller edit, resume on the order.
  useEffect(() => {
    if (resumeOrder) {
      setMode('scanner');
      setOrder(resumeOrder);
      setView('order');
      onConsumeResume?.();
    }
  }, [resumeOrder, onConsumeResume]);

  // Realtime: subscribe to new orders INSERT for this seller's sede.
  // When a customer creates an order (pickup QR), notify the operator immediately.
  useEffect(() => {
    if (!supabase || !isAuthenticated || !sellerLocalId) return;
    const filter = `local_id=eq.${sellerLocalId}`;
    const channel = supabase
      .channel(`seller-new-orders-${sellerLocalId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter }, (payload) => {
        const o = payload.new;
        const alertId = o.id;
        playChime();
        setNewOrderAlerts(prev => [...prev, {
          alertId,
          orderId: o.id,
          total: o.total_price,
          items: Array.isArray(o.items) ? o.items : [],
          ts: new Date(o.created_at || Date.now()),
        }]);
        // Auto-dismiss after 12 s unless manually closed.
        alertTimers.current[alertId] = setTimeout(() => {
          setNewOrderAlerts(prev => prev.filter(a => a.alertId !== alertId));
          delete alertTimers.current[alertId];
        }, 12000);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      Object.values(alertTimers.current).forEach(clearTimeout);
    };
  }, [isAuthenticated, sellerLocalId]);

  // Resolve a scanned/typed code via the sede-scoped RPC (sanitises "#", matches
  // full UUID or short prefix, and records the scan). Returns the first match.
  const loadOrder = async (raw) => {
    setError('');
    setView('loading');
    try {
      const results = await sellerSearchOrder(extractCode(raw));
      if (results && results.length > 0) {
        setOrder(results[0]);
        setView('order');
      } else {
        setError('No encontramos un pedido con ese código en tu sede.');
        setView('scan');
      }
    } catch (e) {
      setError(e?.message || 'No se pudo buscar el pedido.');
      setView('scan');
    }
  };

  const handleScan = (text) => loadOrder(text);

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

  const dismissAlert = (alertId) => {
    clearTimeout(alertTimers.current[alertId]);
    delete alertTimers.current[alertId];
    setNewOrderAlerts(prev => prev.filter(a => a.alertId !== alertId));
  };

  return (
    <div className="pt-28 pb-32 min-h-screen w-full">

      {/* ── Realtime new-order alerts (stacked, fixed top-right) ── */}
      <div className="fixed top-24 right-4 z-[300] flex flex-col gap-3 max-w-[300px] w-full pointer-events-none">
        <AnimatePresence>
          {newOrderAlerts.map(alert => (
            <motion.div
              key={alert.alertId}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="pointer-events-auto bg-[var(--verde-profundo)] border border-[var(--verde-main)]/40 rounded-[20px] p-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[var(--verde-main)] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bell size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui font-bold text-sm text-white leading-tight">¡Nuevo pedido!</p>
                  <p className="font-ui text-xs text-[var(--verde-palido)] mt-0.5">
                    {alert.items.length} ítem(s) · {formatPrice(alert.total)}
                  </p>
                  <p className="font-ui text-[10px] text-white/40 mt-0.5">
                    #{String(alert.orderId).slice(0, 8).toUpperCase()} · {alert.ts.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.alertId)}
                  className="text-white/40 hover:text-white transition-colors p-1 flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-md mx-auto px-6">

        {/* Header */}
        <div className="mb-5 text-center">
          <span className="inline-flex items-center gap-2 bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full font-ui text-xs font-bold uppercase tracking-wider mb-3">
            <ScanLine size={14} /> Caja Origen
            {newOrderAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center -ml-1">
                {newOrderAlerts.length}
              </span>
            )}
          </span>
          <h1 className="font-display italic text-4xl text-[var(--verde-profundo)]">
            {mode === 'scanner' ? 'Escáner de pedidos' : 'Historial de caja'}
          </h1>
          {sellerLocation && <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">{sellerLocation}</p>}
        </div>

        {/* Segmented control: Escáner / Historial */}
        <div className="flex bg-white border border-[var(--verde-palido)] rounded-[16px] p-1 mb-6">
          <button
            onClick={() => setMode('scanner')}
            className={`flex-1 inline-flex items-center justify-center gap-2 font-ui text-sm font-bold py-2.5 rounded-[12px] transition-all ${mode === 'scanner' ? 'bg-[var(--verde-main)] text-white shadow-sm' : 'text-[var(--texto-suave)] hover:text-[var(--verde-profundo)]'}`}
          >
            <ScanLine size={16} /> Escáner
          </button>
          <button
            onClick={() => setMode('history')}
            className={`flex-1 inline-flex items-center justify-center gap-2 font-ui text-sm font-bold py-2.5 rounded-[12px] transition-all ${mode === 'history' ? 'bg-[var(--verde-main)] text-white shadow-sm' : 'text-[var(--texto-suave)] hover:text-[var(--verde-profundo)]'}`}
          >
            <History size={16} /> Historial
          </button>
        </div>

        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-[var(--verde-profundo)] text-white font-ui text-sm px-4 py-3 rounded-[14px] text-center">
            {toast}
          </motion.div>
        )}

        {mode === 'history' ? (
          <SellerHistory onOpenOrder={(o) => { setMode('scanner'); setOrder(o); setView('order'); }} />
        ) : (
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
        )}
      </div>
    </div>
  );
};


// --------------------------------------------------------------------------
// Seller history: only orders this caja has scanned/entered (scanned_at set),
// scoped server-side to the seller's sede, with status + timeframe filters.
// --------------------------------------------------------------------------
const STATUS_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'scanned', label: 'Solo escaneados' },
  { id: 'paid', label: 'Escaneados y pagados' },
];
const TIME_FILTERS = [
  { id: 'today', label: 'Hoy' },
  { id: '1h', label: 'Última hora' },
  { id: '3h', label: 'Últimas 3 h' },
  { id: '12h', label: 'Últimas 12 h' },
];

const sinceFor = (tf) => {
  const now = new Date();
  if (tf === 'today') { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString(); }
  const hours = { '1h': 1, '3h': 3, '12h': 12 }[tf] ?? 0;
  return new Date(now.getTime() - hours * 3600 * 1000).toISOString();
};

const SellerHistory = ({ onOpenOrder }) => {
  const [status, setStatus] = useState('all');     // all | scanned | paid (defaults: All)
  const [timeframe, setTimeframe] = useState('today'); // today | 1h | 3h | 12h (defaults: Today)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await sellerListOrders({ status, since: sinceFor(timeframe) });
      setOrders(data);
    } catch (e) {
      setError(e?.message || 'No se pudo cargar el historial.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, timeframe]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div>
        <p className="font-ui text-[10px] font-bold text-[var(--texto-suave)] uppercase tracking-wider mb-2">Estado</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setStatus(f.id)}
              className={`font-ui text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${status === f.id ? 'bg-[var(--verde-main)] text-white border-[var(--verde-main)]' : 'bg-white text-[var(--texto-suave)] border-[var(--verde-palido)] hover:border-[var(--verde-main)]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe filter */}
      <div>
        <p className="font-ui text-[10px] font-bold text-[var(--texto-suave)] uppercase tracking-wider mb-2">Periodo</p>
        <div className="flex flex-wrap gap-2">
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeframe(f.id)}
              className={`font-ui text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${timeframe === f.id ? 'bg-[var(--verde-profundo)] text-white border-[var(--verde-profundo)]' : 'bg-white text-[var(--texto-suave)] border-[var(--verde-palido)] hover:border-[var(--verde-profundo)]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="font-ui text-xs text-[var(--texto-suave)]">{orders.length} pedido(s)</span>
        <button onClick={fetchOrders} className="inline-flex items-center gap-1.5 font-ui text-xs font-bold text-[var(--verde-profundo)] hover:text-[var(--verde-main)] transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Actualizar
        </button>
      </div>

      {error && <p className="font-ui text-sm text-red-500 text-center py-2">{error}</p>}

      {loading && orders.length === 0 ? (
        <div className="py-16 flex justify-center"><Loader2 size={26} className="animate-spin text-[var(--verde-main)]" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[20px] border border-[var(--verde-palido)] p-10 text-center">
          <Package size={28} className="text-[var(--verde-palido)] mx-auto mb-3" />
          <p className="font-ui text-sm text-[var(--texto-suave)]">No hay pedidos escaneados en este periodo.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map(o => {
            const sid = String(o.id).slice(0, 8).toUpperCase();
            const count = Array.isArray(o.items) ? o.items.reduce((s, it) => s + (it.quantity ?? 1), 0) : 0;
            const when = o.scanned_at || o.created_at;
            return (
              <button
                key={o.id}
                onClick={() => onOpenOrder?.(o)}
                className="w-full text-left bg-white rounded-[18px] border border-[var(--verde-palido)] shadow-sm p-4 flex items-center gap-3 hover:border-[var(--verde-main)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-base text-[var(--verde-profundo)] tracking-wide">#{sid}</span>
                    {o.entregado
                      ? <span className="font-ui text-[10px] font-bold bg-[var(--verde-menta)] text-[var(--verde-main)] px-2 py-0.5 rounded-full uppercase tracking-wider">Pagado</span>
                      : <span className="font-ui text-[10px] font-bold bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-2 py-0.5 rounded-full uppercase tracking-wider">Escaneado</span>}
                  </div>
                  <p className="font-ui text-[11px] text-[var(--texto-suave)] mt-0.5 inline-flex items-center gap-1">
                    <Clock size={11} />{when ? new Date(when).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'} · {count} ítem(s)
                  </p>
                </div>
                <span className="font-display font-bold text-base text-[var(--verde-main)] flex-shrink-0">{formatPrice(o.total_price)}</span>
              </button>
            );
          })}
        </div>
      )}
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
