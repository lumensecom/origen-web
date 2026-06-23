import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const CartaCard = ({ item, onAddToCart, isBebida }) => {
  const [doble, setDoble] = useState(false);
  const precioFinal = doble ? item.precio + 6000 : item.precio;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(doble ? { ...item, nombre: item.nombre + ' — Doble Proteína', precio: precioFinal } : item);
    setDoble(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8F0E8] hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col relative group ${item.esMaximo ? 'border-[var(--maximo-amber)] ring-1 ring-[var(--maximo-amber)]/20' : ''}`}
    >
      <div className="absolute top-6 left-6 z-20">
        <span
          className="px-3 py-1.5 rounded-[12px] text-[10px] font-ui font-bold uppercase tracking-wide"
          style={{ backgroundColor: isBebida ? '#E8F9F0' : item.badge?.bg, color: isBebida ? 'var(--verde-main)' : item.badge?.color }}
        >
          {isBebida ? 'Refrescante' : item.badge?.texto}
        </span>
      </div>

      <div className="w-[180px] h-[180px] mx-auto rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] bg-[#FDFCF8] flex items-center justify-center overflow-hidden mb-5 relative z-10">
        {isBebida ? (
          <span className="text-8xl select-none group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
        ) : item.imagen ? (
          <img loading="lazy" src={item.imagen} alt={item.nombre} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.id === 'tierra' ? 'scale-[1.35]' : ''}`} style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <div className="w-full h-full bg-[#E8F5E8] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">🥗</div>
        )}
      </div>

      <div className="flex-grow flex flex-col items-center">
        <h3 className="font-display font-bold text-[22px] text-[#1A1A1A] leading-[1.2] text-center mb-3">{item.nombre}</h3>
        {isBebida ? (
          <p className="font-ui text-sm text-[var(--texto-suave)] text-center max-w-[240px]">{item.desc}</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {item.ingredientes?.map((ing, i) => (
              <span key={i} className="bg-[#F5F5F5] text-[#2D3A2D] text-[10px] font-medium px-2.5 py-1 rounded-[6px]">{ing}</span>
            ))}
          </div>
        )}
        {!isBebida && item.dietary && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-auto pt-2">
            {item.dietary.map((tag, i) => (
              <span key={i} className="bg-[#E8F5E8] text-[var(--verde-main)] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px]">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center w-full gap-2.5">
        {!isBebida && (
          <button
            onClick={(e) => { e.stopPropagation(); setDoble(d => !d); }}
            className={`w-full py-2 rounded-[12px] font-ui text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${doble ? 'bg-[var(--maximo-amber)] text-white' : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E8F5E8] hover:text-[var(--verde-main)]'}`}
          >
            ⚡ Doble Proteína {doble ? '— Activada' : '+$6.000'}
          </button>
        )}
        <div className="font-display font-bold text-[26px] text-[var(--verde-main)]">{formatPrice(precioFinal)}</div>
        <button
          onClick={handleAdd}
          className="w-full rounded-[24px] border-2 border-[#1A1A1A] text-[#1A1A1A] bg-white text-[13px] font-bold uppercase tracking-wide py-3 hover:bg-[var(--verde-main)] hover:border-[var(--verde-main)] hover:text-white transition-all duration-300 hover:shadow-[0_8px_20px_rgba(18,179,98,0.25)] flex justify-center items-center gap-2"
        >
          Añadir al pedido <ShoppingBag size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartaCard;
