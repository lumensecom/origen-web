// src/components/EditOrderModal.jsx
// Módulo de EDICIÓN — ajustar cantidades o quitar productos de un
// pedido antes de cobrarlo. Al guardar, actualiza Supabase y
// regresa a la pantalla de confirmar pago.
//
// Nota: esto SOLO ajusta cantidades/quita productos del pedido ya
// creado (no agrega productos nuevos del menú, porque no tengo
// acceso al catálogo de productos de tu app). Si ya tienes un
// componente de edición de carrito hecho, puedes reemplazar el
// cuerpo de este modal por ese, manteniendo las props
// (order, onClose, onSaved) iguales.
//
// Props:
//   order    → pedido actual (items, total_price, etc.)
//   onClose  → cerrar sin guardar
//   onSaved(updatedOrder) → guardado correctamente

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import { updateOrderItems } from '../hooks/useOrders'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function EditOrderModal({ order, onClose, onSaved }) {
  const [items, setItems] = useState(() => (order.items ?? []).map((it) => ({ ...it })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)

  function changeQty(index, delta) {
    setItems((prev) =>
      prev
        .map((it, i) => (i === index ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0)
    )
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (items.length === 0) {
      setError('El pedido debe tener al menos un producto.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateOrderItems(order.id, items, total)
      onSaved(updated)
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative w-full sm:max-w-sm bg-[#0f0f0f] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-white font-semibold text-base">Editar pedido #{order.order_number}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-2 max-h-[50vh] overflow-y-auto space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-white/4 rounded-xl px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-white text-sm truncate">{item.emoji && `${item.emoji} `}{item.name}</p>
                <p className="text-white/35 text-xs">{formatCOP(item.price)} c/u</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => changeQty(i, -1)} className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60">
                  <Minus size={12} />
                </button>
                <span className="text-white text-sm w-5 text-center tabular-nums">{item.qty}</span>
                <button onClick={() => changeQty(i, 1)} className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60">
                  <Plus size={12} />
                </button>
                <button onClick={() => removeItem(i)} className="w-7 h-7 rounded-lg bg-red-400/10 hover:bg-red-400/20 flex items-center justify-center text-red-400 ml-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-white/30 text-sm text-center py-6">Sin productos</p>}
        </div>

        <div className="px-6 pt-4 pb-6">
          <div className="flex justify-between items-center border-t border-white/8 pt-4 mb-4">
            <span className="text-white/50 text-sm">Nuevo total</span>
            <span className="text-white font-semibold text-lg">{formatCOP(total)}</span>
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#c8f65d] text-black font-semibold py-3.5 rounded-xl text-sm transition-all hover:bg-[#d4f970] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Guardar y volver a pagar'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}