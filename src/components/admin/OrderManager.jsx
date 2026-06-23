import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Minus, Plus, Trash2, Save, X, CheckCircle2, Clock, MapPin, AlertTriangle,
} from 'lucide-react';
import { adminSearchOrders, updateOrder, deleteOrder } from '../../lib/database';
import { formatPrice } from '../../utils/format';

const shortId = (id) => String(id).slice(0, 8).toUpperCase();
const itemsTotal = (items) => items.reduce((acc, it) => acc + (it.precio ?? 0) * (it.quantity ?? 1), 0);

// One editable order. Admins can change each dish's quantity (the multiplier),
// remove a line, save the changes, or delete the whole order.
const OrderRow = ({ order, onChanged, onDeleted }) => {
  const [items, setItems] = useState(() => (Array.isArray(order.items) ? order.items.map(it => ({ ...it })) : []));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const total = itemsTotal(items);
  const dirty = JSON.stringify(items) !== JSON.stringify(Array.isArray(order.items) ? order.items : []);
  const delivered = !!order.entregado;

  const adjust = (idx, delta) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const q = Math.max(1, (it.quantity ?? 1) + delta);
      return { ...it, quantity: q };
    }));
  };

  const removeLine = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true); setErr(''); setMsg('');
    try {
      const updated = await updateOrder(order.id, { items, total_price: itemsTotal(items) });
      setMsg('Cambios guardados.');
      onChanged?.(updated ?? { ...order, items, total_price: itemsTotal(items) });
    } catch (e) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true); setErr('');
    try {
      await deleteOrder(order.id);
      onDeleted?.(order.id);
    } catch (e) {
      setErr(e?.message || 'No se pudo eliminar.');
      setDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-[var(--verde-palido)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-lg text-[var(--verde-profundo)] tracking-wide">#{shortId(order.id)}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-ui font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${delivered ? 'bg-[var(--verde-menta)] text-[var(--verde-main)]' : 'bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)]'}`}>
            {delivered ? <CheckCircle2 size={11} /> : <Clock size={11} />}
            {delivered ? 'Entregado' : 'Pendiente'}
          </span>
          {order.store_location && (
            <span className="font-ui text-[11px] text-[var(--texto-suave)] inline-flex items-center gap-1"><MapPin size={11} /> {order.store_location}</span>
          )}
        </div>
        <span className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]" title={order.id}>{order.id}</span>
      </div>

      <div className="px-5 pb-3 space-y-2">
        {items.length === 0 && <p className="font-ui text-xs text-[var(--texto-suave)] italic py-2">Este pedido no tiene líneas. Guarda para dejarlo vacío o elimínalo.</p>}
        {items.map((it, idx) => (
          <div key={`${it.id ?? idx}`} className="flex items-center gap-3 bg-[var(--fondo-crema)] rounded-[14px] p-3">
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold text-sm text-[var(--verde-profundo)] truncate">{it.nombre}</p>
              {it.esBuilder && <p className="font-ui text-[10px] text-[var(--texto-suave)] truncate">{it.base} · {it.proteina}</p>}
              <p className="font-ui text-xs text-[var(--texto-suave)]">{formatPrice(it.precio ?? 0)} c/u</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1">
              <button onClick={() => adjust(idx, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors active:scale-90"><Minus size={12} /></button>
              <span className="font-ui text-sm font-bold w-5 text-center text-[var(--verde-profundo)]">{it.quantity ?? 1}</span>
              <button onClick={() => adjust(idx, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[var(--verde-main)] transition-colors active:scale-90"><Plus size={12} /></button>
            </div>
            <span className="font-ui text-sm font-bold text-[var(--verde-main)] w-20 text-right flex-shrink-0">{formatPrice((it.precio ?? 0) * (it.quantity ?? 1))}</span>
            <button onClick={() => removeLine(idx)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors active:scale-90"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {(msg || err) && (
        <p className={`px-5 text-xs font-ui ${err ? 'text-red-500' : 'text-[var(--verde-main)]'}`}>{err || msg}</p>
      )}

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 mt-1">
        <div>
          <span className="font-ui text-[11px] text-[var(--texto-suave)] uppercase tracking-wider">Total</span>
          <p className="font-display font-bold text-xl text-[var(--verde-profundo)]">{formatPrice(total)}</p>
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <button onClick={() => setConfirmDelete(false)} className="inline-flex items-center gap-1 font-ui text-xs font-bold text-gray-500 px-3 py-2 rounded-[12px] hover:bg-gray-100"><X size={14} /> Cancelar</button>
              <button onClick={doDelete} disabled={deleting} className="inline-flex items-center gap-1.5 font-ui text-xs font-bold text-white bg-red-500 px-3 py-2 rounded-[12px] hover:bg-red-600 disabled:opacity-60">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />} Confirmar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 font-ui text-xs font-bold text-red-500 border border-red-200 px-3 py-2 rounded-[12px] hover:bg-red-50 transition-colors"><Trash2 size={14} /> Eliminar</button>
              <button onClick={save} disabled={!dirty || saving} className="inline-flex items-center gap-1.5 font-ui text-xs font-bold text-white bg-[var(--verde-main)] px-4 py-2 rounded-[12px] hover:bg-[var(--verde-vivo)] transition-colors disabled:opacity-40">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const OrderManager = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const runSearch = async (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const data = await adminSearchOrders(q);
      setResults(data);
    } catch (err) {
      setError(err?.message || 'No se pudo buscar el pedido.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onChanged = (updated) => setResults(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  const onDeleted = (id) => setResults(prev => prev.filter(o => o.id !== id));

  return (
    <div className="bg-white rounded-[24px] border border-[var(--verde-palido)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Search size={18} className="text-[var(--verde-main)]" />
        <h3 className="font-display font-bold text-lg text-[var(--verde-profundo)]">Gestión de pedidos</h3>
      </div>
      <p className="font-ui text-xs text-[var(--texto-suave)] mb-5">
        Busca un pedido por su ID (código corto #XXXXXXXX o UUID completo) para editar cantidades o eliminarlo.
      </p>

      <form onSubmit={runSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ej: 3F9A2B7C"
            className="w-full pl-10 pr-4 py-3 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()} className="inline-flex items-center gap-2 bg-[var(--verde-main)] text-white font-ui text-sm font-bold px-5 py-3 rounded-[14px] hover:bg-[var(--verde-vivo)] transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
        </button>
      </form>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 font-ui text-sm px-4 py-3 rounded-[14px]">{error}</div>}

      <AnimatePresence>
        {searched && !loading && results.length === 0 && !error && (
          <p className="font-ui text-sm text-[var(--texto-suave)] text-center py-6">No se encontró ningún pedido con ese ID.</p>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {results.map(order => (
          <OrderRow key={order.id} order={order} onChanged={onChanged} onDeleted={onDeleted} />
        ))}
      </div>
    </div>
  );
};

export default OrderManager;
