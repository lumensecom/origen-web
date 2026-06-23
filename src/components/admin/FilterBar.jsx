import { Calendar, MapPin, Clock, RotateCcw } from 'lucide-react';
import { LOCALES } from '../../constants/locations';

const inputCls = 'w-full px-3 py-2.5 rounded-[12px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-sm text-[var(--verde-profundo)] focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent';
const labelCls = 'font-ui text-[10px] font-bold text-[var(--texto-suave)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5';

// Interactive filters that drive the analytics queries: date range + location
// hit Supabase; the specific-hour filter narrows the loaded set client-side.
const FilterBar = ({ filters, onChange, onReset }) => {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white rounded-[20px] border border-[var(--verde-palido)] p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}><Calendar size={12} /> Desde</label>
          <input type="date" value={filters.fromDate} onChange={e => set({ fromDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><Calendar size={12} /> Hasta</label>
          <input type="date" value={filters.toDate} onChange={e => set({ toDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}><MapPin size={12} /> Sede</label>
          <select value={filters.location} onChange={e => set({ location: e.target.value })} className={inputCls}>
            <option value="">Todas las sedes</option>
            {LOCALES.map(l => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
            <option value="Domicilio">Domicilio</option>
          </select>
        </div>
        <div>
          <label className={labelCls}><Clock size={12} /> Hora</label>
          <select value={filters.hour} onChange={e => set({ hour: e.target.value })} className={inputCls}>
            <option value="">Todo el día</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00 – {String(h).padStart(2, '0')}:59</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <button onClick={onReset} className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold text-[var(--texto-suave)] hover:text-[var(--verde-profundo)] transition-colors">
          <RotateCcw size={13} /> Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
