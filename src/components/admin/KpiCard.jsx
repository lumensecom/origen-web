// Compact KPI tile for the admin dashboard header row.
const KpiCard = ({ icon, label, value, sub, accent = 'var(--verde-main)' }) => (
  <div className="bg-white rounded-[20px] border border-[var(--verde-palido)] p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-[var(--texto-suave)]">{label}</span>
      <span className="w-8 h-8 rounded-[10px] bg-[var(--fondo-crema)] flex items-center justify-center" style={{ color: accent }}>{icon}</span>
    </div>
    <p className="font-display font-bold text-2xl text-[var(--verde-profundo)] leading-none">{value}</p>
    {sub && <p className="font-ui text-xs text-[var(--texto-suave)] mt-2">{sub}</p>}
  </div>
);

export default KpiCard;
