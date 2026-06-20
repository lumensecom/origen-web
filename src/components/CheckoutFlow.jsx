// src/components/CheckoutFlow.jsx
// Flujo completo: tipo de entrega → confirmar → QR
// Reemplaza o envuelve tu componente de carrito existente.
//
// ⚠️ Cambio respecto a la versión anterior: los puntos de lealtad
// YA NO se otorgan aquí. Ahora se otorgan cuando el cajero marca el
// pedido como pagado en el local (createOrder ya no devuelve
// pointsEarned). Aquí solo mostramos un estimado.
//
// Props requeridas:
//   cartItems   → array de { id, name, price, qty, emoji? }
//   totalPrice  → número en pesos COP (entero)
//   userId      → string UUID del usuario autenticado
//   onClose     → función para cerrar el modal/drawer del carrito

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Bike, ChevronRight, ArrowLeft, CheckCircle, Loader2, X } from 'lucide-react'
import { useLocales, createOrder } from '../hooks/useOrders'
import OrderQR from './OrderQR'

const STEPS = { DELIVERY: 'delivery', CONFIRM: 'confirm', SUCCESS: 'success' }

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function CheckoutFlow({ cartItems = [], totalPrice = 0, userId, onClose }) {
  const [step, setStep] = useState(STEPS.DELIVERY)
  const [deliveryType, setDeliveryType] = useState(null) // 'recoger' | 'domicilio'
  const [localeId, setLocaleId] = useState(null)
  const [address, setAddress] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdOrder, setCreatedOrder] = useState(null)

  const { locales, loading: localesLoading } = useLocales()

  const canConfirm =
    (deliveryType === 'recoger' && localeId) ||
    (deliveryType === 'domicilio' && address.trim().length > 4)

  // Estimado informativo — los puntos reales se acreditan al pagar en caja
  const estimatedPoints = Math.floor(totalPrice / 1000)

  async function handleConfirm() {
    if (!canConfirm || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const { order } = await createOrder({
        userId,
        items: cartItems,
        totalPrice,
        deliveryType,
        localeId: deliveryType === 'recoger' ? localeId : null,
        deliveryAddress: deliveryType === 'domicilio' ? address : null,
        deliveryDetails: deliveryType === 'domicilio' ? details : null,
      })
      setCreatedOrder(order)
      setStep(STEPS.SUCCESS)
    } catch (e) {
      setError('No pudimos procesar tu pedido. Intenta de nuevo.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedLocale = locales.find((l) => l.id === localeId)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== STEPS.SUCCESS ? onClose : undefined}
      />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative w-full sm:max-w-md bg-[#0f0f0f] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            {step === STEPS.CONFIRM && (
              <button onClick={() => setStep(STEPS.DELIVERY)} className="text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-white font-semibold text-base tracking-wide">
              {step === STEPS.DELIVERY && 'Tipo de entrega'}
              {step === STEPS.CONFIRM && 'Confirmar pedido'}
              {step === STEPS.SUCCESS && 'Pedido confirmado'}
            </h2>
          </div>
          {step !== STEPS.SUCCESS && (
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {step === STEPS.DELIVERY && (
            <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pb-6">
              <p className="text-white/40 text-sm mb-5 mt-1">¿Cómo quieres recibir tu pedido?</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setDeliveryType('recoger')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    deliveryType === 'recoger' ? 'border-[#c8f65d] bg-[#c8f65d]/5' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${deliveryType === 'recoger' ? 'bg-[#c8f65d]/15' : 'bg-white/5'}`}>
                    <MapPin size={18} className={deliveryType === 'recoger' ? 'text-[#c8f65d]' : 'text-white/40'} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Recoger en punto</p>
                    <p className="text-white/40 text-xs mt-0.5">Elige un local y recibe tu QR</p>
                  </div>
                  {deliveryType === 'recoger' && <CheckCircle size={16} className="text-[#c8f65d] ml-auto shrink-0" />}
                </button>

                <button
                  onClick={() => setDeliveryType('domicilio')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    deliveryType === 'domicilio' ? 'border-[#c8f65d] bg-[#c8f65d]/5' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${deliveryType === 'domicilio' ? 'bg-[#c8f65d]/15' : 'bg-white/5'}`}>
                    <Bike size={18} className={deliveryType === 'domicilio' ? 'text-[#c8f65d]' : 'text-white/40'} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Domicilio</p>
                    <p className="text-white/40 text-xs mt-0.5">Llega a tu dirección</p>
                  </div>
                  {deliveryType === 'domicilio' && <CheckCircle size={16} className="text-[#c8f65d] ml-auto shrink-0" />}
                </button>
              </div>

              <AnimatePresence>
                {deliveryType === 'recoger' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                    <p className="text-white/50 text-xs mb-2 uppercase tracking-widest">Elige el local</p>
                    {localesLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 size={18} className="text-white/30 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {locales.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => setLocaleId(loc.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                              localeId === loc.id ? 'border-[#c8f65d]/60 bg-[#c8f65d]/5 text-white' : 'border-white/8 text-white/60 hover:border-white/20 hover:text-white/80'
                            }`}
                          >
                            <span className="font-medium">{loc.name}</span>
                            <span className="block text-xs mt-0.5 text-white/35">{loc.direccion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {deliveryType === 'domicilio' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Dirección de entrega"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c8f65d]/50"
                    />
                    <input
                      type="text"
                      placeholder="Indicaciones adicionales (apto, torre…)"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c8f65d]/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={!canConfirm}
                onClick={() => setStep(STEPS.CONFIRM)}
                className="w-full flex items-center justify-center gap-2 bg-[#c8f65d] text-black font-semibold text-sm py-3.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4f970]"
              >
                Continuar <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {step === STEPS.CONFIRM && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pb-6">
              <p className="text-white/40 text-sm mb-5 mt-1">Revisa antes de confirmar</p>

              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-white/70">
                      {item.emoji && <span className="mr-1">{item.emoji}</span>}
                      {item.name}
                      {item.qty > 1 && <span className="text-white/40 ml-1">×{item.qty}</span>}
                    </span>
                    <span className="text-white/50">{formatCOP(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/8 pt-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Total</span>
                  <span className="text-white font-semibold">{formatCOP(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/30 text-xs">Entrega</span>
                  <span className="text-white/50 text-xs">
                    {deliveryType === 'recoger' ? `Recoger en ${selectedLocale?.name}` : `Domicilio: ${address}`}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/30 text-xs">Pago</span>
                  <span className="text-white/50 text-xs">
                    {deliveryType === 'recoger' ? 'En el local, al recoger' : 'Coordina con tu domiciliario'}
                  </span>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs mb-4 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#c8f65d] text-black font-semibold text-sm py-3.5 rounded-xl transition-all disabled:opacity-60 hover:bg-[#d4f970]"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Procesando…</> : <>Confirmar pedido</>}
              </button>
            </motion.div>
          )}

          {step === STEPS.SUCCESS && createdOrder && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="px-6 pb-8">
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#c8f65d]/15 flex items-center justify-center mb-3">
                  <CheckCircle size={20} className="text-[#c8f65d]" />
                </div>
                <p className="text-white font-medium">¡Pedido #{createdOrder.order_number} recibido!</p>
                <p className="text-white/40 text-sm mt-1">
                  {deliveryType === 'recoger' ? 'Muestra este QR en el local para pagar y recoger' : 'Tu domicilio está en camino'}
                </p>
                {estimatedPoints > 0 && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#c8f65d] bg-[#c8f65d]/10 px-3 py-1 rounded-full">
                    Ganarás ~{estimatedPoints} puntos al pagar
                  </span>
                )}
              </div>

              {deliveryType === 'recoger' && <OrderQR orderId={createdOrder.id} />}

              <button onClick={onClose} className="w-full mt-6 text-white/50 hover:text-white text-sm transition-colors">
                Cerrar
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}