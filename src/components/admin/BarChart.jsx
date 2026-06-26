import { motion } from 'framer-motion';

// Horizontal bar chart for categorical data (locations, dishes, ingredients).
// Hand-built to match the ORIGEN aesthetic — no chart library.
const BarChart = ({ data = [], color = 'var(--verde-main)', colorFor, colorByRank, formatValue = (v) => v, emptyLabel = 'Sin datos en este rango' }) => {
  if (!data.length) {
    return <p className="font-ui text-sm text-[var(--texto-suave)] py-8 text-center">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...data.map(d => d.value));

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const barColor = colorByRank
          ? colorByRank(i, data.length)
          : (colorFor ? colorFor(d.label) : color);
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="font-ui text-xs text-[var(--verde-profundo)] w-24 sm:w-28 shrink-0 truncate" title={d.label}>{d.label}</span>
            <div className="flex-1 h-7 bg-[var(--fondo-crema)] rounded-[8px] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                className="h-full rounded-[8px]"
                style={{ background: barColor }}
              />
            </div>
            <span className="font-ui text-xs font-bold text-[var(--verde-profundo)] w-16 sm:w-20 text-right shrink-0">{formatValue(d.value)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
