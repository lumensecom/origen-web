import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const MESSAGES = {
  confirmado: '✅ Tu pedido fue confirmado — ya lo estamos preparando',
  listo:      '🎉 Tu bowl está listo para recoger',
  entregado:  (pts) => `🥦 ¡Buen provecho! Ganaste ${pts ?? 50} puntos de lealtad`,
}

const DURATION_MS = 6000

export default function NotificationBar() {
  const { user, isAuthenticated, isSeller } = useAuth()
  const [notifications, setNotifications] = useState([])
  const timers = useRef({})

  // Customers only — sellers have their own alert system
  useEffect(() => {
    if (!supabase || !isAuthenticated || !user || isSeller) return

    const channel = supabase
      .channel(`customer-order-status-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newRow = payload.new
          const oldRow = payload.old ?? {}

          let text = null

          // Status field transitions
          if (newRow.status !== oldRow.status) {
            if (newRow.status === 'confirmado') text = MESSAGES.confirmado
            if (newRow.status === 'listo')      text = MESSAGES.listo
            if (newRow.status === 'entregado')  text = MESSAGES.entregado()
          }
          // entregado boolean → delivery notification (used by current seller Pagar)
          if (!oldRow.entregado && newRow.entregado && !text) {
            text = MESSAGES.entregado()
          }

          if (!text) return

          const id = `notif-${Date.now()}`
          setNotifications(prev => [...prev, { id, text }])
          timers.current[id] = setTimeout(() => dismiss(id), DURATION_MS)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      Object.values(timers.current).forEach(clearTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, isSeller])

  const dismiss = (id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[500] flex flex-col items-center gap-2 pt-2 px-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -48, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -48, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="pointer-events-auto w-full max-w-lg bg-[var(--verde-profundo)] text-white rounded-[16px] shadow-2xl px-5 py-3.5 flex items-center justify-between gap-3 border border-[var(--verde-main)]/30"
          >
            <p className="font-ui text-sm font-semibold leading-snug flex-1">{n.text}</p>
            <button
              onClick={() => dismiss(n.id)}
              className="text-white/50 hover:text-white transition-colors flex-shrink-0 p-1"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
