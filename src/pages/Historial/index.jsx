import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, ArrowRight, Loader2, RefreshCw, CheckCircle2, Clock, MapPin, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getOrderHistory } from '../../lib/database';
import { formatPrice } from '../../utils/format';

// Short, human-friendly order code derived from the UUID (matches the QR modal).
const shortId = (id) => String(id).slice(0, 8).toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];
  const delivered = !!order.entregado;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] border border-[var(--verde-palido)] shadow-sm overflow-hidden"
    >
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 p-5 text-left">
        <div className="w-12 h-12 rounded-[14px] bg-[var(--verde-menta)] flex items-center justify-center text-[var(--verde-main)] flex-shrink-0">
          <ShoppingBag size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-lg text-[var(--verde-profundo)] tracking-wide">#{shortId(order.id)}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-ui font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${delivered ? 'bg-[var(--verde-menta)] text-[var(--verde-main)]' : 'bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)]'}`}>
              {delivered ? <CheckCircle2 size={11} /> : <Clock size={11} />}
              {delivered ? 'Entregado' : 'Pendiente'}
            </span>
          </div>
          <p className="font-ui text-xs text-[var(--texto-suave)] mt-0.5">{formatDate(order.created_at)}</p>
          {order.store_location && (
            <p className="font-ui text-[11px] text-[var(--texto-suave)] mt-0.5 inline-flex items-center gap-1">
              <MapPin size={11} /> {order.store_location}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-lg text-[var(--verde-main)]">{formatPrice(order.total_price)}</p>
          <ChevronDown size={16} className={`text-gray-300 ml-auto mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-[var(--texto-suave)] mb-3 mt-3">Detalle del pedido</p>
          <div className="space-y-2.5">
            {items.map((it, i) => (
              <div key={`${it.id ?? i}`} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-ui font-semibold text-sm text-[var(--verde-profundo)]">
                    {it.quantity}× {it.nombre}
                  </p>
                  {it.esBuilder && (
                    <p className="font-ui text-[11px] text-[var(--texto-suave)] leading-snug">
                      Base: {it.base} · Proteína: {it.proteina}
                      {Array.isArray(it.frescuras) && it.frescuras.length > 0 && ` · Frescuras: ${it.frescuras.join(', ')}`}
                      {Array.isArray(it.sabores) && it.sabores.length > 0 && ` · Sabores: ${it.sabores.join(', ')}`}
                      {it.salsa && ` · Salsa: ${it.salsa}`}
                    </p>
                  )}
                </div>
                <span className="font-ui text-sm text-[var(--texto-suave)] flex-shrink-0">
                  {formatPrice((it.precio ?? 0) * (it.quantity ?? 1))}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="font-ui text-xs text-[var(--texto-suave)]">{order.delivery_type || 'Pedido'}</span>
            <span className="font-display font-bold text-base text-[var(--verde-profundo)]">{formatPrice(order.total_price)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HistorialView = ({ onRequireAuth, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOrderHistory(user.id);
      setOrders(data);
    } catch (e) {
      setError(e?.message || 'No se pudo cargar tu historial.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Keep history fresh as sellers mark orders delivered.
  useEffect(() => {
    if (!supabase || !user) return undefined;
    const channel = supabase
      .channel(`history-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-32 min-h-screen w-full">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-[var(--verde-palido)]">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-[var(--verde-main)]" />
            </div>
            <h2 className="font-display italic text-3xl text-[var(--verde-profundo)] mb-3">Historial de pedidos</h2>
            <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">Inicia sesión para ver todos tus pedidos y su detalle.</p>
            <button onClick={onRequireAuth} className="bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 px-8 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all inline-flex items-center gap-2">
              Iniciar sesión <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-32 min-h-screen w-full bg-[var(--fondo-crema)]">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)]">Historial de pedidos</h1>
            <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">Todos tus pedidos ORIGEN, con su detalle.</p>
          </div>
          <button onClick={fetchOrders} className="inline-flex items-center gap-2 bg-white border border-[var(--verde-palido)] text-[var(--verde-profundo)] font-ui text-sm font-bold px-4 py-2.5 rounded-[14px] hover:bg-[var(--verde-menta)] transition-colors flex-shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 font-ui text-sm px-4 py-3 rounded-[14px]">{error}</div>
        )}

        {loading && orders.length === 0 ? (
          <div className="py-20 flex justify-center"><Loader2 size={28} className="animate-spin text-[var(--verde-main)]" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-[var(--verde-palido)]">
            <span className="text-5xl block mb-4">🥣</span>
            <h3 className="font-display font-bold text-xl text-[var(--verde-profundo)] mb-2">Aún no tienes pedidos</h3>
            <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">Cuando hagas tu primer pedido, aparecerá aquí.</p>
            <button onClick={() => onNavigate?.('menu')} className="bg-[var(--verde-main)] text-white font-ui font-bold py-3 px-8 rounded-[14px] hover:bg-[var(--verde-vivo)] transition-all inline-flex items-center gap-2">
              Ver la carta <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialView;
