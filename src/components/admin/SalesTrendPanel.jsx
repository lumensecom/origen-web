import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';

// Counts of PAID orders (entregado = true) bucketed by the selected granularity.
// We aggregate live from each order's `created_at` instead of keeping manual
// per-period counters: the orders table already persists every sale, so "this
// week" / "year 2026" fall out of the timestamps with no reset logic to drift.

const GRANULARITIES = [
  { id: 'hora',   label: 'Hora' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes',    label: 'Mes' },
  { id: 'anio',   label: 'Año' },
];

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const pad = (n) => String(n).padStart(2, '0');

// Monday-based day index (0 = Mon … 6 = Sun)
const dowIndex = (d) => (d.getDay() + 6) % 7;

// Monday 00:00 of the week containing `ref`
function startOfWeek(ref) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dowIndex(d));
  return d;
}

const SalesTrendPanel = ({ orders = [] }) => {
  const [granularity, setGranularity] = useState('hora');

  // Paid orders only, as Date objects.
  const delivered = useMemo(
    () => orders.filter(o => o.entregado && o.created_at).map(o => new Date(o.created_at)),
    [orders],
  );

  // Years present in the data (plus the current year so the selector is never empty).
  const years = useMemo(() => {
    const s = new Set(delivered.map(d => d.getFullYear()));
    s.add(new Date().getFullYear());
    return [...s].sort((a, b) => a - b);
  }, [delivered]);

  const [year, setYear] = useState(new Date().getFullYear());
  const activeYear = years.includes(year) ? year : years[years.length - 1];

  const { bars, ticks, perBarLabels, scope } = useMemo(() => {
    if (granularity === 'hora') {
      const counts = Array.from({ length: 24 }, (_, h) => ({ key: h, label: `${pad(h)}:00`, count: 0 }));
      delivered.forEach(d => { counts[d.getHours()].count += 1; });
      return { bars: counts, ticks: [0, 3, 6, 9, 12, 15, 18, 21].map(h => `${pad(h)}h`), perBarLabels: false, scope: 'por hora del día' };
    }
    if (granularity === 'semana') {
      const start = startOfWeek(new Date());
      const end = new Date(start); end.setDate(end.getDate() + 7);
      const counts = DOW.map((l, i) => ({ key: i, label: l, count: 0 }));
      delivered.forEach(d => { if (d >= start && d < end) counts[dowIndex(d)].count += 1; });
      return { bars: counts, perBarLabels: true, scope: 'esta semana' };
    }
    if (granularity === 'mes') {
      const counts = MONTHS.map((l, i) => ({ key: i, label: l, count: 0 }));
      delivered.forEach(d => { if (d.getFullYear() === activeYear) counts[d.getMonth()].count += 1; });
      return { bars: counts, perBarLabels: true, scope: `en ${activeYear}` };
    }
    // anio
    const idx = Object.fromEntries(years.map((y, i) => [y, i]));
    const counts = years.map(y => ({ key: y, label: String(y), count: 0 }));
    delivered.forEach(d => { const i = idx[d.getFullYear()]; if (i != null) counts[i].count += 1; });
    return { bars: counts, perBarLabels: true, scope: 'por año' };
  }, [granularity, delivered, activeYear, years]);

  const total = bars.reduce((a, b) => a + b.count, 0);
  const max = Math.max(1, ...bars.map(b => b.count));
  const yMax = max * 1.4; // headroom so the peak bar doesn't touch the top
  const peakKey = bars.reduce((m, b) => (b.count > m.count ? b : m), { count: -1, key: null }).key;

  return (
    <div className="bg-white rounded-[24px] border border-[var(--verde-palido)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--verde-main)]"><Clock size={18} /></span>
            <h3 className="font-display font-bold text-lg text-[var(--verde-profundo)]">Pedidos pagados</h3>
          </div>
          <p className="font-ui text-xs text-[var(--texto-suave)] mt-1">
            {total} {total === 1 ? 'pedido' : 'pedidos'} · {scope}
          </p>
        </div>

        {granularity === 'mes' && (
          <div className="relative">
            <select
              value={activeYear}
              onChange={(e) => setYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-[10px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-xs font-bold text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Granularity toggle */}
      <div className="flex gap-1 bg-[var(--fondo-crema)] p-1 rounded-[12px] mb-5 w-fit">
        {GRANULARITIES.map(g => (
          <button
            key={g.id}
            onClick={() => setGranularity(g.id)}
            className={`px-3 py-1.5 rounded-[9px] font-ui text-xs font-bold transition-all ${
              granularity === g.id
                ? 'bg-[var(--verde-main)] text-white shadow-[0_2px_6px_rgba(18,179,98,0.3)]'
                : 'text-[var(--texto-suave)] hover:text-[var(--verde-profundo)]'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-end gap-[3px] h-44">
        {bars.map((b, i) => {
          const isPeak = b.count > 0 && b.key === peakKey;
          return (
            <div key={b.key} className="flex-1 flex flex-col justify-end items-center group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 whitespace-nowrap font-ui text-[10px] font-bold text-white bg-[var(--verde-profundo)] px-2 py-1 rounded-[6px] shadow-lg z-10">
                {b.label} · {b.count} ped.
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(b.count / yMax) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.015, ease: [0.23, 1, 0.32, 1] }}
                className="w-full rounded-t-[4px] min-h-[2px]"
                style={{ background: isPeak ? 'var(--terracota-vivo)' : 'var(--verde-main)' }}
              />
            </div>
          );
        })}
      </div>

      {/* Axis labels */}
      {perBarLabels ? (
        <div className="flex gap-[3px] mt-2">
          {bars.map(b => (
            <span key={b.key} className="flex-1 text-center font-ui text-[10px] text-[var(--texto-suave)] truncate">
              {b.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex justify-between mt-2 font-ui text-[10px] text-[var(--texto-suave)]">
          {ticks.map(t => <span key={t}>{t}</span>)}
        </div>
      )}
    </div>
  );
};

export default SalesTrendPanel;
