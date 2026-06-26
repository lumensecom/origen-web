import { motion } from 'framer-motion';

// Vertical histogram for the 24-hour sales distribution (peak hours).
const Histogram = ({ data = [], color = 'var(--verde-main)', formatValue = (v) => v }) => {
  const max = Math.max(1, ...data.map(d => d.count));
  const yMax = max * 1.5; // dynamic ceiling: peak bar fills ~67% — headroom makes it look imposing
  const peak = data.reduce((m, d) => (d.count > m.count ? d : m), { count: -1, hour: null });

  return (
    <div>
      <div className="flex items-end gap-[3px] h-44">
        {data.map((d, i) => {
          const isPeak = d.count > 0 && d.hour === peak.hour;
          return (
            <div key={d.hour} className="flex-1 flex flex-col justify-end items-center group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 whitespace-nowrap font-ui text-[10px] font-bold text-white bg-[var(--verde-profundo)] px-2 py-1 rounded-[6px] shadow-lg z-10">
                {String(d.hour).padStart(2, '0')}:00 · {formatValue(d.count)}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / yMax) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.015, ease: [0.23, 1, 0.32, 1] }}
                className="w-full rounded-t-[4px] min-h-[2px]"
                style={{ background: isPeak ? 'var(--terracota-vivo)' : color }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 font-ui text-[10px] text-[var(--texto-suave)]">
        {[0, 3, 6, 9, 12, 15, 18, 21].map(h => <span key={h}>{String(h).padStart(2, '0')}h</span>)}
      </div>
    </div>
  );
};

export default Histogram;
