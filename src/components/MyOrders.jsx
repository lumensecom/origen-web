// src/components/MyOrders.jsx
// Vista "Mis pedidos" para el cliente — actualizado al modelo
// pagado (boolean). Integrar en tu menú de usuario / perfil.
//
// Props:
//   userId → UUID del usuario autenticado (string)

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Bike, ChevronDown, ChevronUp, Loader2, QrCode } from 'lucide-react'
import { useMyOrders } from '../hooks/useOrders'
import OrderQR from './OrderQR'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const statusLabel = order.pagado ? 'Pagado' : 'Pendiente de pago'
  const statusColor = order.pagado ? 'text-[#c8f65d]' : 'text-amber-400'
  const statusDot = order.pagado ? 'bg-[#c8f65d]' : 'bg-amber-400'

  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left" onClick={() => setExpanded((v) => !v)}>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          {order.delivery_type === 'recoger'
            ? <MapPin size={15} className="text-white/40" />
            : <Bike size={15} className="text-white/40" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
            <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
            <span className="text-white/20 text-xs">· #{order.order_number}</span>
          </div>
          <p className="text-white/50 text-xs truncate">
            {formatDate(order.created_at)} · {formatCOP(order.total_price)}
          </p>
        </div>

        {expanded ? <ChevronUp size={14} className="text-white/30 shrink-0" /> : <ChevronDown size={14} className="text-white/30 shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-white/6">
              <div className="pt-4 space-y-1.5">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/60">
                      {item.emoji && <span className="mr-1">{item.emoji}</span>}
                      {item.name}{item.qty > 1 && <span className="text-white/35 ml-1">×{item.qty}</span>}
                    </span>
                    <span className="text-white/40">{formatCOP(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-white/6 pt-2 mt-2">
                  <span className="text-white/40">Total</span>
                  <span className="text-white font-medium">{formatCOP(order.total_price)}</span>
                </div>
              </div>

              {order.delivery_type === 'recoger' && order.locales && (
                <div className="flex items-start gap-2 bg-white/3 rounded-xl px-4 py-3">
                  <MapPin size={13} className="text-white/30 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white/60 text-sm">{order.locales.name}</p>
                    <p className="text-white/30 text-xs">{order.locales.direccion}</p>
                  </div>
                </div>
              )}

              {/* QR solo mientras no se haya pagado/recogido */}
              {order.delivery_type === 'recoger' && !order.pagado && (
                <div>
                  <button
                    onClick={() => setShowQR((v) => !v)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all"
                  >
                    <QrCode size={14} /> {showQR ? 'Ocultar QR' : 'Ver mi QR'}
                  </button>

                  <AnimatePresence>
                    {showQR && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-4 flex justify-center">
                        <OrderQR orderId={order.id} size={180} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MyOrders({ userId }) {
  const { orders, loading } = useMyOrders(userId)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 size={22} className="text-white/20 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package size={28} className="text-white/15 mb-3" />
        <p className="text-white/30 text-sm">Aún no tienes pedidos</p>
        <p className="text-white/15 text-xs mt-1">Tus pedidos aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => <OrderRow key={order.id} order={order} />)}
    </div>
  )
}