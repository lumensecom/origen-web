import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { BEBIDAS } from '../../constants/menu';
import { formatPrice } from '../../utils/format';
import Button from '../../components/ui/Button';
import BowlSVG from './BowlSVG';

// Rebuilds the proteinMode / selectedProteins state from a stored "proteina"
// string (e.g. "Máximo (Pollo + Tofu)", "Doble Tofu", or "Pechuga de Pollo").
const parseProtein = (proteina = '') => {
  if (proteina.startsWith('Máximo')) {
    const inside = proteina.match(/\(([^)]+)\)/)?.[1] ?? '';
    const parts = inside.split('+').map(s => s.trim()).filter(Boolean);
    return { mode: 'doble', proteins: parts };
  }
  if (proteina.startsWith('Doble ')) {
    return { mode: 'doble', proteins: [proteina.replace('Doble ', '').trim()] };
  }
  return { mode: 'sencilla', proteins: proteina ? [proteina] : [] };
};

const OPTIONS = {
  1: { id: 'base', max: 1, icon: '🌾', title: '¿Cuál es tu base?', sub: 'La fundación de tu bowl', items: ['Arroz Blanco', 'Arroz Integral', 'Quinua', 'Mix Asiático'] },
  2: { id: 'frescuras', max: 2, icon: '🥦', title: 'Tus frescuras', sub: 'Elige hasta 2 — frescas y crujientes', items: ['Zuquini', 'Pepino', 'Tomate Cherry', 'Zanahoria', 'Repollo Encurtido', 'Cebolla Encurtida', 'Berenjena', 'Brócoli'] },
  3: { id: 'sabores', max: 2, icon: '✨', title: 'Sabores especiales', sub: 'Lo que hace único a tu bowl — elige hasta 2', items: ['Maíz', 'Mango', 'Manzana', 'Queso parmesano', 'Aguacate', 'Jalapeños', 'Lenteja Crocante', 'Garbanzo Crocante'] },
  4: { id: 'proteina', max: 1, icon: '⚡', title: 'Tu proteína', sub: 'El corazón de tu bowl', items: ['Pechuga de Pollo', 'Huevo Cocido', 'Tofu', 'Carne', 'Lomo de Cerdo'] },
  5: { id: 'salsa', max: 1, icon: '💚', title: 'El toque final', sub: 'La salsa que lo une todo', items: ['Pesto Natural', 'Yogurt de Casa', 'Mango de Casa', 'Fuego Picante', 'Dulce Balance', 'Vino Mango'] },
};

const BASE_PRICE = 24900;

const BuilderView = ({ onAddToCart, editingOrder = null, onSaveEdit, onCancelEdit }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ base: '', frescuras: [], sabores: [], proteina: '', salsa: '' });
  const [proteinMode, setProteinMode] = useState('sencilla');
  const [selectedProteins, setSelectedProteins] = useState([]);
  const [drinkQty, setDrinkQty] = useState({});

  const isEditing = !!editingOrder;

  // When entering edit mode, preload the bowl being edited and jump to the
  // summary so the user can review and tweak. Keyed on the bowl identity.
  useEffect(() => {
    const bowl = editingOrder?.bowl;
    if (!bowl) return;
    setSelections({
      base: bowl.base || '',
      frescuras: bowl.frescuras || [],
      sabores: bowl.sabores || [],
      proteina: bowl.proteina || '',
      salsa: bowl.salsa || '',
    });
    const { mode, proteins } = parseProtein(bowl.proteina || '');
    setProteinMode(mode);
    setSelectedProteins(proteins);
    setDrinkQty({});
    setStep(7);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingOrder?.bowl?.id, editingOrder?.token]);

  const isMaximo = proteinMode === 'doble';
  const proteinSurcharge = isMaximo ? 6000 : 0;
  const drinksTotal = BEBIDAS.reduce((acc, b) => acc + (drinkQty[b.id] || 0) * b.precio, 0);
  const activeDrinks = BEBIDAS.filter(b => (drinkQty[b.id] || 0) > 0);
  const totalPrice = BASE_PRICE + proteinSurcharge + drinksTotal;

  const curr = OPTIONS[step];

  const toggleSelection = (category, item, max) => {
    setSelections(prev => {
      const current = prev[category];
      if (Array.isArray(current)) {
        if (current.includes(item)) return { ...prev, [category]: current.filter(i => i !== item) };
        if (current.length < max) return { ...prev, [category]: [...current, item] };
        return prev;
      }
      return { ...prev, [category]: item === current ? '' : item };
    });
  };

  const handleProteinSelect = (prot) => {
    if (proteinMode === 'sencilla') {
      setSelectedProteins([prot]);
      setSelections(prev => ({ ...prev, proteina: prot }));
    } else {
      setSelectedProteins(prev => {
        let next;
        if (prev.includes(prot)) {
          next = prev.filter(p => p !== prot);
        } else {
          next = prev.length < 2 ? [...prev, prot] : prev;
        }
        const formatted = next.length === 2 ? `Máximo (${next[0]} + ${next[1]})` : next.length === 1 ? `Doble ${next[0]}` : '';
        setSelections(cur => ({ ...cur, proteina: formatted }));
        return next;
      });
    }
  };

  const changeDrinkQty = (drink, delta) => {
    setDrinkQty(prev => {
      const newQty = (prev[drink.id] || 0) + delta;
      if (newQty <= 0) {
        const { [drink.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [drink.id]: newQty };
    });
  };

  const isStepCompleted = useMemo(() => {
    if (step === 6) return true;
    if (!curr) return false;
    if (curr.id === 'proteina') return selectedProteins.length > 0;
    const currentSelection = selections[curr.id];
    if (Array.isArray(currentSelection)) return currentSelection.length > 0;
    return currentSelection !== '';
  }, [selections, curr, step, selectedProteins]);

  const resetBuilder = () => {
    setStep(1);
    setSelections({ base: '', frescuras: [], sabores: [], proteina: '', salsa: '' });
    setSelectedProteins([]);
    setDrinkQty({});
  };

  const handleFinish = () => {
    onAddToCart({
      id: `custom-${Date.now()}`,
      nombre: isMaximo ? 'BOWL MÁXIMO PERSONALIZADO' : 'BOWL PERSONALIZADO',
      precio: BASE_PRICE + proteinSurcharge,
      esBuilder: true,
      ...selections,
    });
    activeDrinks.forEach(drink => {
      const qty = drinkQty[drink.id];
      for (let i = 0; i < qty; i++) onAddToCart({ ...drink, imagen: null });
    });
    resetBuilder();
  };

  // In edit mode we save the bowl back to its existing order (cart line or DB
  // row) instead of creating a new one. Drinks are managed separately, so the
  // edit only touches the bowl itself.
  const handleSaveEdit = () => {
    onSaveEdit?.({
      id: editingOrder?.bowl?.id,
      nombre: isMaximo ? 'BOWL MÁXIMO PERSONALIZADO' : 'BOWL PERSONALIZADO',
      precio: BASE_PRICE + proteinSurcharge,
      esBuilder: true,
      ...selections,
    });
    resetBuilder();
  };

  // Edit mode skips the drinks step (6): 5 → summary (7).
  const goNext = () => {
    if (!isStepCompleted) return;
    if (isEditing && step === 5) { setStep(7); return; }
    setStep(s => Math.min(7, s + 1));
  };

  const progressSteps = isEditing ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-[var(--fondo-crema)] w-full flex flex-col lg:flex-row">

      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 bg-[var(--verde-profundo)] text-white flex flex-col h-[100svh] sticky top-0 z-20 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-24 pb-4 lg:px-12 lg:pt-28">
          <div className="mb-8">
            {isEditing && (
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-2 bg-[var(--terracota-vivo)]/20 text-[var(--terracota-suave)] px-3 py-1.5 rounded-full font-ui text-xs font-bold uppercase tracking-wider">
                  ✏️ Editando tu pedido
                </span>
                <button onClick={() => { resetBuilder(); onCancelEdit?.(); }} className="inline-flex items-center gap-1.5 text-[var(--verde-palido)] hover:text-white font-ui text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                  <X size={14} /> Cancelar
                </button>
              </div>
            )}
            <h1 className="font-display italic text-4xl md:text-5xl text-white mb-2">{isEditing ? 'Edita tu ' : 'Crea tu '}<span className="text-[var(--terracota-vivo)]">Origen</span></h1>
            <p className="font-ui text-[var(--verde-palido)] opacity-80">{isEditing ? 'Ajusta tu bowl y guarda los cambios en tu pedido.' : 'Diseño intuitivo para crear tu bowl perfecto.'}</p>
          </div>

          {/* Precio móvil */}
          <div className="lg:hidden bg-[var(--verde-bosque)]/95 backdrop-blur-md p-4 rounded-[16px] mb-8 flex justify-between items-center border border-[var(--verde-main)]/20 shadow-lg">
            <span className="font-ui text-sm text-[var(--verde-palido)]">Total Combo:</span>
            <motion.span key={totalPrice} className={`font-display font-bold text-2xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-white'}`}>{formatPrice(totalPrice)}</motion.span>
          </div>

          {/* Pasos 1–5 */}
          {step <= 5 && (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl">{curr?.icon}</span>
                  <div>
                    <h2 className="font-ui font-bold text-2xl">{curr?.title}</h2>
                    <p className="font-accent text-lg text-[var(--verde-palido)]">{curr?.sub}</p>
                  </div>
                </div>

                {curr?.id === 'proteina' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-2 bg-[var(--verde-bosque)] p-1 rounded-[14px]">
                      <button
                        onClick={() => { setProteinMode('sencilla'); setSelectedProteins([]); setSelections(p => ({ ...p, proteina: '' })); }}
                        className={`py-3 rounded-[10px] font-ui text-xs font-bold uppercase transition-all ${proteinMode === 'sencilla' ? 'bg-[var(--verde-main)] text-white' : 'text-[var(--verde-palido)] hover:text-white'}`}
                      >Sencilla</button>
                      <button
                        onClick={() => { setProteinMode('doble'); setSelectedProteins([]); setSelections(p => ({ ...p, proteina: '' })); }}
                        className={`py-3 rounded-[10px] font-ui text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${proteinMode === 'doble' ? 'bg-[var(--maximo-amber)] text-[var(--verde-profundo)] font-extrabold' : 'text-[var(--verde-palido)] hover:text-white'}`}
                      >⚡ Máxima (Doble) (+$6.000)</button>
                    </div>
                    {proteinMode === 'doble' ? (
                      <div className="flex items-start gap-2 bg-[var(--maximo-amber)]/15 border border-[var(--maximo-amber)]/40 px-3 py-2.5 rounded-[12px]">
                        <span className="text-sm shrink-0">⚡</span>
                        <p className="font-ui text-xs text-[var(--verde-palido)] leading-relaxed">
                          <strong className="text-[var(--maximo-amber)]">1 proteína = porción doble</strong> de la misma · o elige 2 diferentes para combo mixto
                        </p>
                      </div>
                    ) : (
                      <p className="font-ui text-xs text-[var(--verde-palido)] italic">Selecciona tu proteína favorita para una porción clásica.</p>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      {curr?.items.map(item => {
                        const isSelected = selectedProteins.includes(item);
                        const isDisabled = proteinMode === 'doble' && selectedProteins.length >= 2 && !isSelected;
                        return (
                          <button key={item} onClick={() => handleProteinSelect(item)} disabled={isDisabled}
                            className={`text-left p-4 rounded-[16px] transition-all duration-300 font-ui border-2 flex items-center justify-between ${isSelected ? (proteinMode === 'doble' ? 'bg-[var(--maximo-amber)] text-[var(--verde-profundo)] border-[var(--maximo-amber)]' : 'bg-[var(--verde-main)] text-white border-[var(--verde-main)]') : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-palido)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className="font-bold text-lg block">{item}</span>
                            <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-current' : 'border-current opacity-30'}`}>
                              {isSelected && <Check size={14} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {curr?.max === 2 && Array.isArray(selections[curr.id]) && selections[curr.id].length === 1 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-[var(--verde-main)]/20 border border-[var(--verde-main)]/30 px-3 py-2 rounded-[10px]">
                        <span className="text-sm">✌️</span>
                        <p className="font-ui text-xs text-[var(--verde-palido)]">Solo elegiste 1 — recibirás <strong className="text-white">doble porción</strong>. Puedes elegir un segundo diferente.</p>
                      </motion.div>
                    )}
                    <div className={`grid gap-4 ${step === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {curr?.items.map(item => {
                        const isArray = Array.isArray(selections[curr.id]);
                        const isSelected = isArray ? selections[curr.id].includes(item) : selections[curr.id] === item;
                        const isDisabled = isArray && !isSelected && selections[curr.id].length >= curr.max;
                        return (
                          <button key={item} onClick={() => toggleSelection(curr.id, item, curr.max)} disabled={isDisabled}
                            className={`text-left p-4 rounded-[16px] transition-all duration-300 font-ui border-2 ${isSelected ? 'bg-[var(--verde-main)] text-white border-[var(--verde-main)] shadow-md' : 'bg-[var(--verde-bosque)]/50 text-[var(--verde-palido)] border-[var(--verde-bosque)] hover:bg-[var(--verde-bosque)]'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between group`}
                          >
                            <span className="font-bold text-lg">{item}</span>
                            <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center ${isSelected ? 'border-current bg-white/10 text-white' : 'border-current opacity-30'}`}>
                              {isSelected && <Check size={14} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Paso 6: Bebidas */}
          {step === 6 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🍹</span>
                <div>
                  <h2 className="font-ui font-bold text-2xl">¿Algo para tomar?</h2>
                  <p className="font-accent text-lg text-[var(--verde-palido)]">Combina tu bowl con bebidas naturales de la casa</p>
                </div>
              </div>
              <div className="space-y-3">
                {BEBIDAS.map(drink => {
                  const qty = drinkQty[drink.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div key={drink.id}
                      className={`p-4 rounded-[20px] border-2 transition-all flex items-center justify-between ${isSelected ? 'bg-[var(--verde-main)] border-[var(--verde-main)] text-white' : 'bg-[var(--verde-bosque)]/50 border-transparent text-[var(--verde-palido)]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{drink.emoji}</span>
                        <div>
                          <h4 className="font-ui font-bold text-base">{drink.nombre}</h4>
                          <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'} max-w-[180px]`}>{drink.desc}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-ui font-bold block">{formatPrice(drink.precio)}</span>
                        {isSelected ? (
                          <div className="flex items-center gap-2 bg-white/20 rounded-full px-1 py-0.5">
                            <button onClick={() => changeDrinkQty(drink, -1)} className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center font-bold text-white transition-all">−</button>
                            <span className="font-ui font-bold text-sm w-5 text-center">{qty}</span>
                            <button onClick={() => changeDrinkQty(drink, 1)} className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center font-bold text-white transition-all">+</button>
                          </div>
                        ) : (
                          <button onClick={() => changeDrinkQty(drink, 1)} className="px-4 py-1.5 rounded-full font-ui text-[10px] font-bold uppercase bg-[var(--verde-main)] text-white transition-all">Añadir</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Paso 7: Resumen */}
          {step === 7 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bg-[var(--verde-bosque)] p-8 rounded-[24px] border border-[var(--verde-main)]/20">
              <h2 className="font-display italic text-3xl mb-6 text-[var(--verde-main)]">🎉 Tu combo está listo</h2>
              <div className="space-y-3 font-ui text-[var(--verde-palido)] mb-6 text-sm">
                <p>• <strong className="text-white">Base:</strong> {selections.base}</p>
                <p>• <strong className="text-white">Frescuras:</strong> {selections.frescuras.join(' + ')}</p>
                <p>• <strong className="text-white">Sabores:</strong> {selections.sabores.join(' + ')}</p>
                <p>• <strong className="text-white">Proteína:</strong> {selections.proteina || 'Sin proteína'}</p>
                <p>• <strong className="text-white">Salsa:</strong> {selections.salsa}</p>
                {activeDrinks.length > 0 && <p>• <strong className="text-white">Bebidas:</strong> {activeDrinks.map(d => `${d.nombre}${drinkQty[d.id] > 1 ? ` x${drinkQty[d.id]}` : ''}`).join(', ')}</p>}
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="font-ui text-lg">Total a pagar:</span>
                <span className={`font-display font-bold text-3xl ${isMaximo ? 'text-[var(--maximo-amber)]' : 'text-[var(--verde-main)]'}`}>{formatPrice(totalPrice)}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 bg-[var(--verde-profundo)] border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] px-6 py-4 lg:px-12">
          {step <= 6 && (
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(s => Math.max(1, s - 1))} className={`font-ui font-semibold text-sm text-[var(--verde-palido)] hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                ← Volver
              </button>
              <div className="flex gap-2">
                {progressSteps.map(i => <div key={i} className={`h-2 rounded-[4px] transition-all duration-300 ${i === step ? 'w-8 bg-[var(--terracota-vivo)]' : 'w-2 bg-white/20'}`} />)}
              </div>
              <Button onClick={goNext} variant="primary" disabled={!isStepCompleted} className={`bg-[var(--verde-main)] text-white hover:bg-[var(--verde-vivo)] rounded-[16px] transition-all duration-300 ${!isStepCompleted ? 'opacity-40 cursor-not-allowed hover:translate-y-0' : ''}`}>
                {(step === 6 || (isEditing && step === 5)) ? 'Ver Resumen' : 'Siguiente'} <ArrowRight size={16} />
              </Button>
            </div>
          )}
          {step === 7 && (
            <div className="flex gap-3">
              {isEditing ? (
                <Button onClick={handleSaveEdit} className="flex-1 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white rounded-[16px]">Guardar cambios</Button>
              ) : (
                <Button onClick={handleFinish} className="flex-1 bg-[var(--verde-main)] hover:bg-[var(--verde-vivo)] text-white rounded-[16px]">Agregar al Pedido</Button>
              )}
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-[16px] border border-white/20 hover:bg-white/10 transition font-ui font-semibold text-sm text-white">Modificar</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — preview desktop */}
      <div className="hidden lg:block w-full lg:w-1/2 bg-[var(--fondo-crema)] relative">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-12">
          <div className="flex items-center justify-between w-full max-w-sm bg-white px-6 py-4 rounded-[20px] mb-8 shadow-sm border border-[var(--verde-palido)]">
            <div>
              <p className="font-ui text-[10px] text-[var(--texto-suave)] uppercase tracking-wider font-bold mb-0.5">Tu bowl personalizado</p>
              <motion.p key={totalPrice} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="font-display font-bold text-3xl text-[var(--verde-profundo)]">{formatPrice(totalPrice)}</motion.p>
            </div>
            {isMaximo && <div className="bg-[var(--maximo-amber)]/10 text-[var(--maximo-amber)] px-3 py-1.5 rounded-[10px] text-xs font-bold">⚡ MÁXIMO</div>}
            {!isMaximo && selections.proteina && <div className="bg-[var(--terracota-suave)]/30 text-[var(--terracota-quemado)] px-3 py-1.5 rounded-[10px] text-xs font-bold">Porción sencilla</div>}
          </div>

          <div className="w-full max-w-sm bg-white rounded-[28px] border border-[var(--verde-palido)] shadow-md p-8 space-y-4">
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--verde-main)] mb-2">Tu bowl en construcción 🥣</p>
            {[
              { label: 'Base', emoji: '🌾', value: selections.base, empty: 'Elige tu base' },
              { label: 'Frescuras', emoji: '🥦', value: selections.frescuras.join(' + '), empty: 'Elige tus frescuras' },
              { label: 'Sabores', emoji: '✨', value: selections.sabores.join(' + '), empty: 'Elige tus sabores' },
              { label: 'Proteína', emoji: '⚡', value: selections.proteina, empty: 'Elige tu proteína' },
              { label: 'Salsa', emoji: '💚', value: selections.salsa, empty: 'Elige tu salsa' },
            ].map(({ label, emoji, value, empty }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-lg mt-0.5 shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-0.5">{label}</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={value || empty} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}
                      className={`font-display text-base leading-snug truncate ${value ? 'text-[var(--verde-profundo)] font-semibold' : 'text-gray-300 italic'}`}>
                      {value || empty}
                    </motion.p>
                  </AnimatePresence>
                </div>
                {value && <Check size={16} className="text-[var(--verde-main)] shrink-0 mt-1" />}
              </div>
            ))}
            {activeDrinks.length > 0 && (
              <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                <span className="text-lg mt-0.5 shrink-0">🍹</span>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--texto-suave)] mb-0.5">Bebidas</p>
                  <p className="font-display text-base text-[var(--verde-profundo)] font-semibold leading-snug">{activeDrinks.map(d => `${d.nombre}${drinkQty[d.id] > 1 ? ` x${drinkQty[d.id]}` : ''}`).join(', ')}</p>
                </div>
                <Check size={16} className="text-[var(--verde-main)] shrink-0 mt-1" />
              </div>
            )}
          </div>
          {step === 7 && <p className="font-display italic text-xl text-[var(--terracota-quemado)] mt-8 text-center font-bold">¡Tu bowl está listo para ordenar!</p>}
        </div>
      </div>
    </div>
  );
};

export default BuilderView;
