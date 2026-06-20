// src/components/PaymentScanner.jsx
// Módulo de PAGO — pantalla del cajero.
// Un cajero solo ve/paga pedidos de SU local (reforzado también
// por RLS en Supabase, no solo en el frontend).
//
// Props:
//   localeId    → UUID del local asignado al cajero (user.app_metadata.locale_id)
//   localeName  → nombre del local, para el encabezado

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, CheckCircle2, Pencil, ArrowRight, Loader2, AlertTriangle, Search } from 'lucide-react'
import { useQrScanner } from '../hooks/useQrScanner'
import { getOrderById, markAsPaid } from '../hooks/useOrders'
import EditOrderModal from './EditOrderModal'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const SCREENS = { SCAN: 'scan', FOUND: 'found', PAID: 'paid' }

export default function PaymentScanner({ localeId, localeName }) {
  const [screen, setScreen] = useState(SCREENS.SCAN)
  const [order, setOrder] = useState(null)
  const [manualId, setManualId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)
  const [editing, setEditing] = useState(false)

  const lookup = useCallback(async (rawId) => {
    const clean = rawId.trim()
    if (!clean) return
    setLoading(true)
    setError(null)
    try {
      const found = await getOrderById(clean)

      if (found.locale_id !== localeId) {
        setError('Este pedido no pertenece a tu local.')
        return
      }
      if (found.pagado) {
        setError(`El pedido #${found.order_number} ya estaba pagado.`)
        return
      }

      setOrder(found)
      setScreen(SCREENS.FOUND)
    } catch {
      setError('Pedido no encontrado. Verifica el código.')
    } finally {
      setLoading(false)
    }
  }, [localeId])

  const { videoRef, canvasRef, active, error: camError, start, stop } = useQrScanner(lookup)

  async function handlePagar() {
    setPaying(true)
    setError(null)
    try {
      const updated = await markAsPaid(order.id)
      setOrder((o) => ({ ...o, ...updated }))
      setScreen(SCREENS.PAID)
    } catch (e) {
      setError(e?.message ?? 'No se pudo marcar como pagado. Intenta otra vez.')
    } finally {
      setPaying(false)
    }
  }

  function handleSiguiente() {
    setOrder(null)
    setManualId('')
    setError(null)
    setScreen(SCREENS.SCAN)
  }

  function handleOrderUpdated(updatedOrder) {
    setOrder(updatedOrder)
    setEditing(false)
    setScreen(SCREENS.FOUND) // vuelve a la pantalla de confirmar pago
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="text-[#c8f65d] text-xs uppercase tracking-widest font-medium mb-1">Caja</p>
          <h1 className="text-xl font-semibold">{localeName || '—'}</h1>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Escanear ─────────────────────────────────────── */}
          {screen === SCREENS.SCAN && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={active ? stop : start}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm mb-4 transition-all ${
                  active ? 'bg-red-400/10 text-red-400' : 'bg-[#c8f65d] text-black hover:bg-[#d4f970]'
                }`}
              >
                {active ? <><CameraOff size={16} /> Detener cámara</> : <><Camera size={16} /> Escanear QR</>}
              </button>

              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden rounded-2xl mb-4 relative"
                  >
                    <video ref={videoRef} className="w-full rounded-2xl" playsInline muted style={{ maxHeight: 320, objectFit: 'cover' }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-44 border-2 border-[#c8f65d]/70 rounded-2xl" />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </motion.div>
                )}
              </AnimatePresence>

              {camError && <p className="text-red-400 text-xs text-center mb-4">{camError}</p>}

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-white/30 text-xs">o ingresa el código</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookup(manualId)}
                  placeholder="ID del pedido"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#c8f65d]/50 font-mono"
                />
                <button
                  onClick={() => lookup(manualId)}
                  disabled={loading || !manualId.trim()}
                  className="px-4 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 transition-all disabled:opacity-40"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-4 bg-red-400/8 px-3 py-2.5 rounded-lg">
                  <AlertTriangle size={13} className="shrink-0" /> {error}
                </p>
              )}
            </motion.div>
          )}

          {/* ── Pedido encontrado, confirmar pago ───────────── */}
          {screen === SCREENS.FOUND && order && (
            <motion.div key="found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-6">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Pedido</p>
                <p className="text-5xl font-bold text-[#c8f65d] tabular-nums">#{order.order_number}</p>
              </div>

              <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-5">
                {order.profiles && <p className="text-white/50 text-sm mb-3">{order.profiles.full_name}</p>}
                <div className="space-y-1.5 mb-3">
                  {(order.items ?? []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white/70">
                        {item.emoji && `${item.emoji} `}{item.name}{item.qty > 1 && ` ×${item.qty}`}
                      </span>
                      <span className="text-white/40">{formatCOP(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-white/8 pt-3">
                  <span className="text-white/50 text-sm">Total</span>
                  <span className="text-white font-semibold text-lg">{formatCOP(order.total_price)}</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs mb-4 bg-red-400/8 px-3 py-2 rounded-lg">{error}</p>}

              <button
                onClick={handlePagar}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 bg-[#c8f65d] text-black font-semibold py-4 rounded-xl text-sm mb-3 transition-all hover:bg-[#d4f970] disabled:opacity-60"
              >
                {paying ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Pagado</>}
              </button>

              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm py-2 transition-colors"
              >
                <Pencil size={13} /> Editar pedido
              </button>
            </motion.div>
          )}

          {/* ── Pagado ──────────────────────────────────────── */}
          {screen === SCREENS.PAID && order && (
            <motion.div key="paid" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#c8f65d]/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-[#c8f65d]" />
              </div>
              <p className="text-white font-medium mb-1">Pedido #{order.order_number} pagado</p>
              <p className="text-white/40 text-sm mb-8">{formatCOP(order.total_price)}</p>

              <button
                onClick={handleSiguiente}
                className="w-full flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 text-white font-medium py-3.5 rounded-xl text-sm transition-all"
              >
                Siguiente pedido <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editing && order && (
          <EditOrderModal order={order} onClose={() => setEditing(false)} onSaved={handleOrderUpdated} />
        )}
      </AnimatePresence>
    </div>
  )
}