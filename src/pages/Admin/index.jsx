import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Receipt, CheckCircle2, TrendingUp, TrendingDown,
  MapPin, Clock, Salad, ShieldAlert, RefreshCw, Loader2, ArrowRight,
  Users, UserPlus, Search, Trash2, ChevronDown, X,
  Shield, Calendar, AlertCircle, Check, Loader, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../features/admin/useAnalytics';
import { formatPrice } from '../../utils/format';
import { INGREDIENTE_COLORES } from '../../constants/menu';
import KpiCard from '../../components/admin/KpiCard';
import BarChart from '../../components/admin/BarChart';
import Histogram from '../../components/admin/Histogram';
import FilterBar from '../../components/admin/FilterBar';
import OrderManager from '../../components/admin/OrderManager';
import {
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  getLocales,
} from '../../lib/database';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS = { fromDate: '', toDate: '', location: '', hour: '' };

const formatCompact = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}k`;
  return `$${v}`;
};

const Panel = ({ title, icon, children, accent }) => (
  <div className="bg-white rounded-[24px] border border-[var(--verde-palido)] p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-5">
      <span className="text-[var(--verde-main)]" style={accent ? { color: accent } : undefined}>{icon}</span>
      <h3 className="font-display font-bold text-lg text-[var(--verde-profundo)]">{title}</h3>
    </div>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// User management helpers
// ---------------------------------------------------------------------------

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('') || '??';

const ROLE_META = {
  admin:    { label: 'Admin',    bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  seller:   { label: 'Vendedor', bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-500' },
  customer: { label: 'Cliente',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const AVATAR_COLORS = [
  'bg-[#12B362] text-white', 'bg-blue-500 text-white', 'bg-amber-500 text-white',
  'bg-purple-500 text-white', 'bg-rose-500 text-white', 'bg-teal-500 text-white',
];
const avatarColor = (id = '') => AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];

const inputCls =
  'w-full px-4 py-2.5 rounded-[12px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent';

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RoleBadge({ rol }) {
  const meta = ROLE_META[rol] ?? ROLE_META.customer;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-ui uppercase tracking-wide ${meta.bg} ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sales dashboard tab
// ---------------------------------------------------------------------------

function VentasTab({ onRequireAuth }) {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { loading, error, metrics, refresh } = useAnalytics(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full font-ui text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--verde-main)] animate-pulse" /> En vivo
          </span>
          <h2 className="font-display italic text-3xl text-[var(--verde-profundo)]">Métricas de ventas</h2>
          <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">Tiempo real de toda la cadena ORIGEN.</p>
        </div>
        <button onClick={refresh} className="inline-flex items-center gap-2 bg-white border border-[var(--verde-palido)] text-[var(--verde-profundo)] font-ui text-sm font-bold px-4 py-2.5 rounded-[14px] hover:bg-[var(--verde-menta)] transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Actualizar
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-ui text-sm px-4 py-3 rounded-[14px]">{error}</div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign size={16} />} label="Ventas totales" value={formatPrice(metrics.totalSales)} sub={`${metrics.totalOrders} pedidos`} />
        <KpiCard icon={<ShoppingBag size={16} />} label="Pedidos" value={metrics.totalOrders} accent="var(--terracota-quemado)" />
        <KpiCard icon={<Receipt size={16} />} label="Ticket promedio" value={formatPrice(metrics.avgTicket)} />
        <KpiCard icon={<CheckCircle2 size={16} />} label="Entregados" value={metrics.delivered} sub={`${metrics.totalOrders - metrics.delivered} pendientes`} accent="var(--terracota-quemado)" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Ventas por sede" icon={<MapPin size={18} />}>
          <BarChart data={metrics.locations} formatValue={formatCompact} color="var(--verde-main)" />
        </Panel>
        <Panel title="Horas pico de venta" icon={<Clock size={18} />}>
          <Histogram data={metrics.hours} formatValue={(v) => `${v} ped.`} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Platos más vendidos" icon={<TrendingUp size={18} />}>
          <BarChart data={metrics.topDishes} color="var(--verde-main)" />
        </Panel>
        <Panel title="Platos menos vendidos" icon={<TrendingDown size={18} />} accent="var(--terracota-quemado)">
          <BarChart data={metrics.bottomDishes} color="var(--terracota-vivo)" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Ingredientes más usados" icon={<Salad size={18} />}>
          <BarChart data={metrics.topIngredients} colorFor={(label) => INGREDIENTE_COLORES[label] || 'var(--verde-main)'} />
        </Panel>
        <Panel title="Ingredientes menos usados" icon={<TrendingDown size={18} />} accent="var(--terracota-quemado)">
          <BarChart data={metrics.bottomIngredients} colorFor={(label) => INGREDIENTE_COLORES[label] || 'var(--terracota-vivo)'} />
        </Panel>
      </div>

      <p className="font-ui text-xs text-[var(--texto-suave)] text-center">
        Los ingredientes provienen de los bowls personalizados en «Arma tu bowl».
      </p>

      <div>
        <OrderManager />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// User management tab
// ---------------------------------------------------------------------------

function UserRow({ u, onDelete, isCurrentUser }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(u.id); }
    finally { setDeleting(false); setConfirming(false); }
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="border-b border-gray-50 hover:bg-[var(--fondo-crema)] transition-colors group"
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-ui font-bold text-xs flex-shrink-0 ${avatarColor(u.id)}`}>
            {initials(u.nombre)}
          </div>
          <div className="min-w-0">
            <p className="font-ui font-semibold text-sm text-[var(--verde-profundo)] truncate max-w-[180px]">
              {u.nombre}
              {isCurrentUser && <span className="ml-1.5 text-[10px] bg-[var(--verde-menta)] text-[var(--verde-main)] px-1.5 py-0.5 rounded-full font-bold">Tú</span>}
            </p>
            <p className="font-ui text-[11px] text-[var(--texto-suave)] truncate max-w-[180px]">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4"><RoleBadge rol={u.rol} /></td>
      <td className="py-3.5 px-4">
        {u.local_name ? (
          <span className="font-ui text-xs text-[var(--texto-suave)] flex items-center gap-1">
            <MapPin size={12} className="text-[var(--verde-main)] flex-shrink-0" />{u.local_name}
          </span>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        {u.tipo === 'customer'
          ? <span className="font-ui text-xs font-semibold text-[var(--verde-main)]">{u.loyalty_points} pts</span>
          : <span className="text-gray-300 text-sm">—</span>}
      </td>
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <span className="font-ui text-xs text-[var(--texto-suave)]">{formatDate(u.created_at)}</span>
      </td>
      <td className="py-3.5 px-4 text-right">
        {!confirming ? (
          <button
            onClick={() => !isCurrentUser && setConfirming(true)}
            disabled={isCurrentUser}
            title={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
            className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ml-auto ${
              isCurrentUser ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className="font-ui text-[10px] text-red-500 font-semibold">¿Eliminar?</span>
            <button onClick={handleDelete} disabled={deleting} className="w-7 h-7 rounded-[6px] bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-60">
              {deleting ? <Loader size={12} className="animate-spin" /> : <Check size={12} />}
            </button>
            <button onClick={() => setConfirming(false)} className="w-7 h-7 rounded-[6px] bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={12} />
            </button>
          </div>
        )}
      </td>
    </motion.tr>
  );
}

function Select({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-8 pr-8 py-2.5 rounded-[12px] bg-white border border-gray-200 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function CreateUserModal({ locales, onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', rol: 'customer', idLocal: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminCreateUser({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        rol: form.rol,
        idLocal: form.rol === 'seller' ? Number(form.idLocal) : null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.email.trim() && form.password.length >= 6 && form.rol && (form.rol !== 'seller' || form.idLocal);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-7">
          <div>
            <h3 className="font-display italic text-2xl text-[var(--verde-profundo)]">Crear usuario</h3>
            <p className="font-ui text-xs text-[var(--texto-suave)] mt-0.5">El acceso queda activo de inmediato</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo">
            <input type="text" value={form.fullName} onChange={set('fullName')} placeholder="Ej: María García" className={inputCls} />
          </Field>
          <Field label="Email *">
            <input type="email" required value={form.email} onChange={set('email')} placeholder="usuario@ejemplo.com" className={inputCls} />
          </Field>
          <Field label="Contraseña temporal *">
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field label="Rol *">
            <div className="grid grid-cols-3 gap-2">
              {['customer', 'seller', 'admin'].map((r) => {
                const meta = ROLE_META[r];
                const active = form.rol === r;
                return (
                  <button key={r} type="button" onClick={() => setForm((p) => ({ ...p, rol: r, idLocal: '' }))}
                    className={`py-2.5 px-3 rounded-[12px] font-ui text-xs font-bold transition-all border-2 ${active ? `${meta.bg} ${meta.text} border-current` : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <AnimatePresence>
            {form.rol === 'seller' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Field label="Sede asignada *">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select required={form.rol === 'seller'} value={form.idLocal} onChange={set('idLocal')} className={`${inputCls} pl-9 appearance-none`}>
                      <option value="">Seleccionar sede…</option>
                      {locales.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] font-ui text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-[14px] border-2 border-gray-200 font-ui font-bold text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={!isValid || loading} className="flex-1 py-3 rounded-[14px] bg-[var(--verde-main)] text-white font-ui font-bold text-sm hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function UsuariosTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [localFilter, setLocalFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, localesData] = await Promise.all([adminListUsers(), getLocales()]);
      setUsers(userData);
      setLocales(localesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId) => {
    await adminDeleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredUsers = useMemo(() => {
    const now = new Date();
    return users.filter((u) => {
      if (roleFilter && u.rol !== roleFilter) return false;
      if (localFilter && String(u.id_local) !== localFilter) return false;
      if (periodFilter) {
        const days = Number(periodFilter);
        const cutoff = new Date(now);
        if (days === 1) cutoff.setHours(0, 0, 0, 0);
        else cutoff.setDate(cutoff.getDate() - days);
        if (new Date(u.created_at) < cutoff) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!u.email?.toLowerCase().includes(q) && !u.nombre?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, localFilter, periodFilter]);

  const kpiCards = [
    { icon: Users,       label: 'Usuarios totales', value: users.length,                                    color: 'text-[var(--verde-main)]',  bg: 'bg-[var(--verde-menta)]' },
    { icon: ShoppingBag, label: 'Clientes',          value: users.filter((u) => u.rol === 'customer').length, color: 'text-emerald-600',           bg: 'bg-emerald-50' },
    { icon: TrendingUp,  label: 'Vendedores',        value: users.filter((u) => u.rol === 'seller').length,  color: 'text-blue-600',              bg: 'bg-blue-50' },
    { icon: Shield,      label: 'Administradores',   value: users.filter((u) => u.rol === 'admin').length,   color: 'text-amber-600',             bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display italic text-3xl text-[var(--verde-profundo)]">Gestión de Usuarios</h2>
        <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">Administra cuentas de clientes y staff de todas las sedes.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-[16px] font-ui text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchUsers} className="ml-auto flex items-center gap-1.5 text-xs font-bold hover:text-red-800">
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      )}

      {/* KPI strip */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-[20px] p-5 border border-[var(--verde-palido)] shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-[14px] ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className={`font-display font-bold text-2xl leading-none ${color}`}>{value}</p>
                <p className="font-ui text-[11px] text-[var(--texto-suave)] mt-0.5 uppercase tracking-wide font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-[28px] border border-[var(--verde-palido)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--verde-menta)] flex items-center justify-center">
              <Users size={18} className="text-[var(--verde-main)]" />
            </div>
            <div>
              <h3 className="font-ui font-bold text-base text-[var(--verde-profundo)]">Usuarios del sistema</h3>
              {!loading && (
                <p className="font-ui text-xs text-[var(--texto-suave)]">
                  {filteredUsers.length === users.length ? `${users.length} usuarios en total` : `${filteredUsers.length} de ${users.length} usuarios`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} disabled={loading} className="w-9 h-9 rounded-[10px] bg-[var(--fondo-crema)] flex items-center justify-center text-[var(--texto-suave)] hover:text-[var(--verde-main)] hover:bg-[var(--verde-menta)] transition-all disabled:opacity-40">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white font-ui font-bold text-xs px-4 py-2.5 rounded-[12px] transition-all shadow-[0_4px_12px_rgba(18,179,98,0.25)] active:scale-[0.98]">
              <UserPlus size={15} /> Crear usuario
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pt-5 pb-2 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white border border-gray-200 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)]" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <Select value={roleFilter} onChange={setRoleFilter} icon={<Shield size={14} />}
            options={[{ value: '', label: 'Todos los roles' }, { value: 'customer', label: 'Clientes' }, { value: 'seller', label: 'Vendedores' }, { value: 'admin', label: 'Administradores' }]} />
          <Select value={localFilter} onChange={setLocalFilter} icon={<MapPin size={14} />}
            options={[{ value: '', label: 'Todas las sedes' }, ...locales.map((l) => ({ value: String(l.id), label: l.name }))]} />
          <Select value={periodFilter} onChange={setPeriodFilter} icon={<Calendar size={14} />}
            options={[{ value: '', label: 'Cualquier fecha' }, { value: '1', label: 'Hoy' }, { value: '7', label: 'Últimos 7 días' }, { value: '30', label: 'Últimos 30 días' }]} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[var(--texto-suave)]">
              <Loader size={20} className="animate-spin text-[var(--verde-main)]" />
              <span className="font-ui text-sm">Cargando usuarios…</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="font-ui text-sm text-[var(--texto-suave)]">
                {users.length === 0 ? 'Aún no hay usuarios registrados.' : 'Ningún usuario coincide con los filtros.'}
              </p>
              {(search || roleFilter || localFilter || periodFilter) && (
                <button onClick={() => { setSearch(''); setRoleFilter(''); setLocalFilter(''); setPeriodFilter(''); }}
                  className="mt-3 font-ui text-xs text-[var(--verde-main)] font-bold hover:underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[var(--fondo-crema)]">
                  {['Usuario', 'Rol', 'Sede', 'Puntos', 'Miembro desde', ''].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--texto-suave)] ${h === 'Puntos' ? 'hidden md:table-cell' : h === 'Miembro desde' ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <UserRow key={u.id} u={u} onDelete={handleDelete} isCurrentUser={u.id === user?.id} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="font-ui text-[11px] text-gray-400">Pasa el cursor sobre una fila para ver la opción de eliminar.</p>
            <p className="font-ui text-[11px] text-gray-400">Los cambios son permanentes e inmediatos.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateUserModal locales={locales} onClose={() => setShowCreate(false)} onCreated={fetchUsers} />}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Admin module — tab switcher between Ventas and Usuarios
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'ventas',   label: 'Panel de Ventas', icon: <DollarSign size={15} /> },
  { id: 'usuarios', label: 'Usuarios',        icon: <Users size={15} /> },
];

export default function AdminView({ onRequireAuth }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('ventas');

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="pt-32 pb-32 min-h-screen w-full">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-[var(--verde-palido)]">
            <div className="w-20 h-20 bg-[var(--verde-menta)] rounded-[20px] flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={36} className={isAuthenticated ? 'text-red-400' : 'text-[var(--verde-main)]'} />
            </div>
            <h2 className="font-display italic text-3xl text-[var(--verde-profundo)] mb-3">
              {isAuthenticated ? 'Panel solo para administradores' : 'Acceso de administrador'}
            </h2>
            <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">
              {isAuthenticated
                ? 'Tu cuenta no tiene permisos de administrador. Contacta al dueño de la cadena.'
                : 'Inicia sesión con una cuenta de administrador para ver el panel.'}
            </p>
            {!isAuthenticated && (
              <button onClick={onRequireAuth} className="bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 px-8 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all inline-flex items-center gap-2">
                Iniciar sesión <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-32 min-h-screen w-full bg-[var(--fondo-crema)]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6">
          <span className="font-ui text-[var(--verde-main)] font-bold tracking-[0.2em] uppercase text-xs">Panel de Administración</span>
          <h1 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)] mt-1">Panel ORIGEN</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-white border border-[var(--verde-palido)] p-1.5 rounded-[18px] w-fit shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] font-ui font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--verde-main)] text-white shadow-[0_2px_8px_rgba(18,179,98,0.3)]'
                  : 'text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] hover:bg-[var(--fondo-crema)]'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === 'ventas'   && <VentasTab onRequireAuth={onRequireAuth} />}
            {activeTab === 'usuarios' && <UsuariosTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
