import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARTA, BEBIDAS } from '../../constants/menu';
import CartaCard from './CartaCard';

const VIRALES_IDS = ['tierra', 'fuego', 'cosecha', 'dulce', 'raiz'];
const CATEGORIAS = ['Todos', 'Mariscos', 'Proteína Animal', 'Vegetariano', 'Especiales', 'Bebidas'];

const CartaView = ({ onAddToCart }) => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const virales = useMemo(() => CARTA.filter(b => VIRALES_IDS.includes(b.id)), []);

  const bowlsFiltrados = useMemo(() => {
    if (filtroActivo === 'Bebidas') return BEBIDAS;
    return CARTA.filter(bowl => {
      if (filtroActivo === 'Todos') return true;
      if (filtroActivo === 'Especiales') return bowl.badge?.texto === 'Premium';
      return bowl.tag === filtroActivo;
    });
  }, [filtroActivo]);

  return (
    <div className="pt-32 pb-32 bg-[#FAFAFA] w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="text-center mb-16 animate-in">
          <h1 className="font-display italic text-5xl md:text-7xl text-[var(--verde-profundo)] mb-4">Carta Origen</h1>
          <p className="font-ui text-lg text-[#2D5A4A]">Combinaciones perfectas y bebidas frescas de la casa.</p>
        </div>

        {/* Virales de la semana */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-base">🔥</span>
            <h2 className="font-ui font-bold text-xs uppercase tracking-[0.2em] text-[var(--terracota-quemado)]">Platos Virales de la Semana</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-6 px-6">
            {virales.map(bowl => (
              <div
                key={bowl.id}
                onClick={() => onAddToCart(bowl)}
                className="flex-shrink-0 w-40 bg-white rounded-[18px] border border-[#E8F0E8] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className="h-24 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                  {bowl.imagen
                    ? <img loading="lazy" src={bowl.imagen} alt={bowl.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <span className="text-4xl">🥗</span>}
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-[11px] text-[#1A1A1A] leading-tight mb-1">{bowl.nombre}</p>
                  <p className="font-ui text-[10px] text-[var(--texto-suave)] mb-1.5">{bowl.proteina}</p>
                  <p className="font-display font-bold text-sm text-[var(--verde-main)]">${bowl.precio.toLocaleString('es-CO')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-hide animate-in justify-start md:justify-center">
          {CATEGORIAS.map((t, i) => (
            <button
              key={i}
              onClick={() => setFiltroActivo(t)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-[12px] font-ui text-sm font-semibold transition-all duration-300 ${filtroActivo === t ? 'bg-[var(--terracota-vivo)] text-[var(--verde-profundo)] shadow-md' : 'bg-white border border-[#E8F0E8] text-[#2D3A2D] hover:bg-[#F5F5F5]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {bowlsFiltrados.map(item => {
              const isBebida = filtroActivo === 'Bebidas' || !item.tag;
              return <CartaCard key={item.id} item={item} onAddToCart={onAddToCart} isBebida={isBebida} />;
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CartaView;
