import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Receipt, CheckCircle2, TrendingUp, TrendingDown,
  MapPin, Clock, Salad, ShieldAlert, RefreshCw, Loader2, ArrowRight,
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

const AdminView = ({ onRequireAuth }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { loading, error, metrics, refresh } = useAnalytics(filters);

  // ---------- Role gates ----------
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
                : 'Inicia sesión con una cuenta de administrador para ver las métricas de ventas.'}
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
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-[var(--verde-menta)] text-[var(--verde-main)] px-4 py-1.5 rounded-full font-ui text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--verde-main)] animate-pulse" /> En vivo
            </span>
            <h1 className="font-display italic text-4xl md:text-5xl text-[var(--verde-profundo)]">Panel de Ventas</h1>
            <p className="font-ui text-sm text-[var(--texto-suave)] mt-1">Métricas en tiempo real de toda la cadena ORIGEN.</p>
          </div>
          <button onClick={refresh} className="inline-flex items-center gap-2 bg-white border border-[var(--verde-palido)] text-[var(--verde-profundo)] font-ui text-sm font-bold px-4 py-2.5 rounded-[14px] hover:bg-[var(--verde-menta)] transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Actualizar
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 font-ui text-sm px-4 py-3 rounded-[14px]">{error}</div>
        )}

        {/* KPIs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={<DollarSign size={16} />} label="Ventas totales" value={formatPrice(metrics.totalSales)} sub={`${metrics.totalOrders} pedidos`} />
          <KpiCard icon={<ShoppingBag size={16} />} label="Pedidos" value={metrics.totalOrders} accent="var(--terracota-quemado)" />
          <KpiCard icon={<Receipt size={16} />} label="Ticket promedio" value={formatPrice(metrics.avgTicket)} />
          <KpiCard icon={<CheckCircle2 size={16} />} label="Entregados" value={metrics.delivered} sub={`${metrics.totalOrders - metrics.delivered} pendientes`} accent="var(--terracota-quemado)" />
        </motion.div>

        {/* Sales by location + Peak hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Panel title="Ventas por sede" icon={<MapPin size={18} />}>
            <BarChart data={metrics.locations} formatValue={formatCompact} color="var(--verde-main)" />
          </Panel>
          <Panel title="Horas pico de venta" icon={<Clock size={18} />}>
            <Histogram data={metrics.hours} formatValue={(v) => `${v} ped.`} />
          </Panel>
        </div>

        {/* Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Panel title="Platos más vendidos" icon={<TrendingUp size={18} />}>
            <BarChart data={metrics.topDishes} color="var(--verde-main)" />
          </Panel>
          <Panel title="Platos menos vendidos" icon={<TrendingDown size={18} />} accent="var(--terracota-quemado)">
            <BarChart data={metrics.bottomDishes} color="var(--terracota-vivo)" />
          </Panel>
        </div>

        {/* Ingredients (Arma tu bowl) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Ingredientes más usados" icon={<Salad size={18} />}>
            <BarChart data={metrics.topIngredients} colorFor={(label) => INGREDIENTE_COLORES[label] || 'var(--verde-main)'} />
          </Panel>
          <Panel title="Ingredientes menos usados" icon={<TrendingDown size={18} />} accent="var(--terracota-quemado)">
            <BarChart data={metrics.bottomIngredients} colorFor={(label) => INGREDIENTE_COLORES[label] || 'var(--terracota-vivo)'} />
          </Panel>
        </div>

        <p className="font-ui text-xs text-[var(--texto-suave)] text-center mt-8">
          Los ingredientes provienen de los bowls personalizados en «Arma tu bowl».
        </p>

        {/* Order management — search by ID, edit quantities, delete */}
        <div className="mt-10">
          <OrderManager />
        </div>
      </div>
    </div>
  );
};

export default AdminView;
