import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Minus, Plus, Trash2, Store, MapPin, Pencil, QrCode, Loader2, CheckCircle2, Bell } from 'lucide-react';
import useLockBodyScroll from '../hooks/useLockBodyScroll';
import { LOCALES } from '../constants/locations';
import { formatPrice } from '../utils/format';

const CheckoutModal = ({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClose,
  onConfirmOrder,
  onEditItem,
  onPayAll,
  onClearCart,
  qrUnlocked = false,
  pickupStore = null,
  isAuthenticated,
  onRequireAuth,
}) => {
  useLockBodyScroll(true);
  const [step, setStep] = useState('cart');
  const [selectedStore, setSelectedStore] = useState(null);
  const [address, setAddress] = useState('');
  const [telefono, setTelefono] = useState('');
  const [zona, setZona] = useState('');
  const [details, setDetails] = useState('');
  const [payingAll, setPayingAll] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [qrError, setQrError] = useState('');

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.precio * item.quantity, 0), [cart]);

  const goBack = () => {
    if (step === 'deliveryType') setStep('cart');
    else if (step === 'pickupStore' || step === 'deliveryAddress') setStep('deliveryType');
  };

  // Pickup confirmation: unlocks in-store QR payment and returns to the cart
  // zone (now QR-enabled). No WhatsApp — the operator is notified via Realtime.
  const handlePickupConfirm = async () => {
    setQrError('');
    setConfirming(true);
    try {
      await onConfirmOrder({ modalidad: 'Recoger en Local', store: selectedStore });
      setStep('cart');
    } catch (e) {
      setQrError(e?.message || 'No se pudo confirmar el pedido. Intenta de nuevo.');
    } finally {
      setConfirming(false);
    }
  };

  // Delivery confirmation: persists the order in Supabase. No WhatsApp.
  const handleDeliveryConfirm = async () => {
    setQrError('');
    setConfirming(true);
    try {
      await onConfirmOrder({
        modalidad: 'Domicilio',
        direccion: address,
        telefono,
        zona,
        detalles: details,
      });
    } catch (e) {
      setQrError(e?.message || 'No se pudo confirmar el pedido. Intenta de nuevo.');
    } finally {
      setConfirming(false);
    }
  };

  const handlePayAll = async () => {
    if (!isAuthenticated) { onRequireAuth?.(); return; }
    setPayingAll(true);
    setQrError('');
    try {
      await onPayAll();
    } catch (e) {
      setQrError(e?.message || 'No se pudo generar el QR. Intenta de nuevo.');
    } finally {
      setPayingAll(false);
    }
  };

  const stepLabel = {
    cart: qrUnlocked ? 'Tu Pedido — Pagar' : 'Tu Pedido',
    deliveryType: '¿Cómo lo recibes?',
    pickupStore: 'Elige tu sede',
    deliveryAddress: '¿A dónde lo llevamos?',
  };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-sm p-8 rounded-[28px] text-center shadow-2xl">
          <span className="text-5xl block mb-4">🥣</span>
          <h3 className="font-display font-bold text-2xl text-[var(--verde-profundo)] mb-2">Aún no hay nada aquí</h3>
          <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">Explora nuestra carta y agrega tu bowl favorito.</p>
          <button onClick={onClose} className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-3.5 rounded-[16px] hover:bg-[var(--verde-vivo)] transition-all">Ver Carta</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step !== 'cart' && (
              <button onClick={goBack} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                <ArrowLeft size={16} className="text-gray-600" />
              </button>
            )}
            <h2 className="font-display italic text-xl text-[var(--verde-profundo)]">{stepLabel[step]}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">

            {step === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                {/* QR-unlocked banner: pickup confirmed, pay at the counter */}
                {qrUnlocked && (
                  <div className="flex items-start gap-2.5 bg-[var(--verde-menta)] border border-[var(--verde-palido)] rounded-[16px] p-3.5 mb-1">
                    <CheckCircle2 size={18} className="text-[var(--verde-main)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">¡Pedido listo para pagar!</p>
                      <p className="font-ui text-xs text-[var(--texto-suave)]">
                        {pickupStore?.nombre ? `Recoges en ${pickupStore.nombre}. ` : ''}
                        Genera el QR del pedido completo y muéstralo en caja.
                      </p>
                    </div>
                  </div>
                )}

                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="p-3 bg-[var(--fondo-crema)] rounded-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[12px] overflow-hidden bg-[var(--verde-menta)] flex items-center justify-center text-xl flex-shrink-0">
                        {item.imagen ? <img loading="lazy" src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" /> : (item.emoji || '🥣')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-bold text-sm text-[var(--verde-profundo)] truncate">{item.nombre}</p>
                        {item.esBuilder && <p className="font-ui text-[10px] text-[var(--texto-suave)] truncate">{item.base} · {item.proteina}</p>}
                        <p className="font-ui text-sm font-bold text-[var(--verde-main)]">{formatPrice(item.precio * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1">
                        <button onClick={() => onUpdateQty(item, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors active:scale-90">
                          <Minus size={12} />
                        </button>
                        <span className="font-ui text-sm font-bold w-4 text-center text-[var(--verde-profundo)]">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[var(--verde-main)] transition-colors active:scale-90">
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Non-builder items can't be edited in the builder — keep a small delete inline */}
                      {!item.esBuilder && (
                        <button onClick={() => onRemoveItem(item)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors active:scale-90">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Builder bowls: prominent "Editar pedido" ABOVE a small, muted delete */}
                    {item.esBuilder && (
                      <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-black/5">
                        <button
                          onClick={() => onEditItem?.(item)}
                          className="w-full flex items-center justify-center gap-2 bg-[var(--verde-main)] text-white font-ui font-bold text-sm py-3 rounded-[14px] hover:bg-[var(--verde-vivo)] transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(18,179,98,0.25)]"
                        >
                          <Pencil size={16} /> Editar pedido
                        </button>
                        <button
                          onClick={() => onRemoveItem(item)}
                          className="self-center inline-flex items-center gap-1.5 text-xs font-ui font-semibold text-[var(--texto-suave)] hover:text-red-500 transition-colors py-1"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {qrUnlocked && (
                  <button
                    onClick={onClearCart}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-ui font-semibold text-[var(--texto-suave)] hover:text-red-500 transition-colors py-2"
                  >
                    <Trash2 size={13} /> Vaciar carrito
                  </button>
                )}
              </motion.div>
            )}

            {step === 'deliveryType' && (
              <motion.div key="delivery" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                <button onClick={() => setStep('pickupStore')} className="w-full flex items-center gap-4 p-5 bg-[var(--fondo-crema)] rounded-[20px] hover:bg-[var(--verde-menta)] group transition-all text-left border-2 border-transparent hover:border-[var(--verde-main)]">
                  <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center text-[var(--verde-main)] shadow-sm group-hover:scale-110 transition-transform">
                    <Store size={22} />
                  </div>
                  <div>
                    <p className="font-ui font-bold text-base text-[var(--verde-profundo)]">Recoger en local</p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">Listo en minutos — paga con QR en caja</p>
                  </div>
                  <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => setStep('deliveryAddress')} className="w-full flex items-center gap-4 p-5 bg-[var(--fondo-crema)] rounded-[20px] hover:bg-[var(--verde-menta)] group transition-all text-left border-2 border-transparent hover:border-[var(--verde-main)]">
                  <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center text-[var(--verde-main)] shadow-sm group-hover:scale-110 transition-transform">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="font-ui font-bold text-base text-[var(--verde-profundo)]">Pedir a domicilio</p>
                    <p className="font-ui text-xs text-[var(--texto-suave)]">Te lo llevamos directo a tu puerta</p>
                  </div>
                  <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-[var(--verde-main)] group-hover:translate-x-1 transition-all" />
                </button>
              </motion.div>
            )}

            {step === 'pickupStore' && (
              <motion.div key="pickup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                {LOCALES.map(store => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[18px] border-2 text-left transition-all ${selectedStore?.id === store.id ? 'border-[var(--verde-main)] bg-[var(--verde-menta)]' : 'border-gray-100 bg-[var(--fondo-crema)] hover:border-[var(--verde-palido)]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedStore?.id === store.id ? 'border-[var(--verde-main)]' : 'border-gray-300'}`}>
                      {selectedStore?.id === store.id && <div className="w-2.5 h-2.5 bg-[var(--verde-main)] rounded-full" />}
                    </div>
                    <div>
                      <p className="font-ui font-bold text-sm text-[var(--verde-profundo)]">{store.nombre}</p>
                      <p className="font-ui text-xs text-[var(--texto-suave)]">{store.direccion}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'deliveryAddress' && (
              <motion.div key="address" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Dirección en Bogotá *</label>
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej: Calle 26 # 68-10, Apto 402"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Teléfono de contacto *</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Ej: 310 311 2799"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Barrio / Zona</label>
                  <input
                    type="text"
                    autoComplete="address-level3"
                    value={zona}
                    onChange={e => setZona(e.target.value)}
                    placeholder="Ej: Chapinero"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-ui text-xs font-bold text-[var(--texto-suave)] uppercase tracking-wider block mb-2">Indicaciones adicionales</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Ej: frente al parque, timbre 402"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-[var(--fondo-crema)] border border-gray-200 font-ui text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--verde-main)] focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-ui text-sm text-[var(--texto-suave)]">Total del pedido</span>
            <span className="font-display font-bold text-2xl text-[var(--verde-profundo)]">{formatPrice(cartTotal)}</span>
          </div>

          {step === 'cart' && !qrUnlocked && (
            <button onClick={() => setStep('deliveryType')} className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] flex items-center justify-center gap-2">
              Continuar al pedido <ArrowRight size={18} />
            </button>
          )}
          {step === 'cart' && qrUnlocked && (
            <div className="space-y-2.5">
              <button
                onClick={handlePayAll}
                disabled={payingAll}
                className="w-full bg-[var(--verde-profundo)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-bosque)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {payingAll ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
                {payingAll ? 'Generando…' : 'Pagar todo — QR del pedido'}
              </button>
              {qrError && <p className="font-ui text-xs text-red-500 text-center pt-1">{qrError}</p>}
            </div>
          )}
          {step === 'pickupStore' && (
            <div className="space-y-2.5">
              <button
                onClick={handlePickupConfirm}
                disabled={!selectedStore || confirming}
                className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirming ? <Loader2 size={18} className="animate-spin" /> : null}
                {confirming ? 'Confirmando…' : 'Confirmar pedido'} {!confirming && <ArrowRight size={18} />}
              </button>
              {qrError && <p className="font-ui text-xs text-red-500 text-center pt-1">{qrError}</p>}
            </div>
          )}
          {step === 'deliveryAddress' && (
            <div className="space-y-2.5">
              <button
                onClick={handleDeliveryConfirm}
                disabled={!address.trim() || !telefono.trim() || confirming}
                className="w-full bg-[var(--verde-main)] text-white font-ui font-bold py-4 rounded-[18px] hover:bg-[var(--verde-vivo)] transition-all shadow-[0_4px_14px_rgba(18,179,98,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirming ? <Loader2 size={18} className="animate-spin" /> : null}
                {confirming ? 'Confirmando…' : 'Confirmar pedido'} {!confirming && <ArrowRight size={18} />}
              </button>
              {qrError && <p className="font-ui text-xs text-red-500 text-center pt-1">{qrError}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
