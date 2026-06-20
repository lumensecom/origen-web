// src/components/AdminGeneralPanel.jsx
// Módulo ADMIN — panel de visualización para admin_general.
// Pensado para alguien sin conocimientos técnicos: solo botones
// y números, sin escribir consultas.
//
// Props:
//   user → objeto de sesión de Supabase (para mostrar el email)

import { useState, useMemo } from 'react'
import { Calendar, DollarSign, ShoppingBag, Clock, TrendingUp } from 'lucide-react'
import { useDailyOrders, useLocales } from '../hooks/useOrders'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

function todayISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={accent ? 'text-[#c8f65d]' : 'text-white/40'} />
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${accent ? 'text-[#c8f65d]' : 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function AdminGeneralPanel({ user }) {
  const [date, setDate] = useState(todayISO())
  const [localeFilter, setLocaleFilter] = useState(null) // null = todos

  const { locales } = useLocales()
  const { orders, loading } = useDailyOrders(date, localeFilter)

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.pagado)
    const pending = orders.filter((o) => !o.pagado)
    const totalVendido = paid.reduce((sum, o) => sum + o.total_price, 0)
    const ticketPromedio = paid.length > 0 ? Math.round(totalVendido / paid.length) : 0

    const hours = Array.from({ length: 24 }, () => 0)
    paid.forEach((o) => {
      const h = new Date(o.created_at).getHours()
      hours[h] += o.total_price
    })
    const maxHour = Math.max(...hours, 1)

    const byLocale = {}
    paid.forEach((o) => {
      const name = o.locales?.name ?? 'Sin local'
      byLocale[name] = (byLocale[name] ?? 0) + o.total_price
    })

    return { paid, pending, totalVendido, ticketPromedio, hours, maxHour, byLocale }
  }, [orders])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-5 py-8">

        <div className="mb-6">
          <p className="text-[#c8f65d] text-xs uppercase tracking-widest font-medium mb-1">Panel admin</p>
          <h1 className="text-2xl font-semibold">Resumen del día</h1>
          <p className="text-white/30 text-sm mt-1">{user?.email}</p>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-white/30" />
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#c8f65d]/40"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setLocaleFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              localeFilter === null ? 'bg-[#c8f65d] text-black' : 'bg-white/6 text-white/50 hover:bg-white/10'
            }`}
          >
            Todos los locales
          </button>
          {locales.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setLocaleFilter(loc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                localeFilter === loc.id ? 'bg-[#c8f65d] text-black' : 'bg-white/6 text-white/50 hover:bg-white/10'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/30 text-sm text-center py-12">Cargando…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <KpiCard icon={DollarSign} label="Total vendido" value={formatCOP(stats.totalVendido)} accent />
              <KpiCard icon={ShoppingBag} label="Pedidos pagados" value={stats.paid.length} />
              <KpiCard icon={TrendingUp} label="Ticket promedio" value={formatCOP(stats.ticketPromedio)} />
              <KpiCard icon={Clock} label="Pendientes de pago" value={stats.pending.length} />
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-5 mb-6">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Ventas por hora</p>
              <div className="flex items-end gap-1 h-32">
                {stats.hours.map((value, h) => (
                  <div key={h} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className={`w-full rounded-t-sm transition-all ${value > 0 ? 'bg-[#c8f65d]/70 group-hover:bg-[#c8f65d]' : 'bg-white/5'}`}
                      style={{ height: `${value > 0 ? Math.max((value / stats.maxHour) * 100, 4) : 2}%` }}
                    />
                    {value > 0 && (
                      <div className="absolute -top-7 hidden group-hover:block text-[10px] bg-black border border-white/10 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                        {formatCOP(value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-white/25 mt-2">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>
            </div>

            {localeFilter === null && Object.keys(stats.byLocale).length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {Object.entries(stats.byLocale).map(([name, total]) => (
                  <div key={name} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center">
                    <p className="text-white/40 text-xs mb-1">{name}</p>
                    <p className="text-white text-sm font-semibold">{formatCOP(total)}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3">
                Pedidos del día ({orders.length})
              </p>
              <div className="space-y-1.5">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-white/3 rounded-lg px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${o.pagado ? 'bg-[#c8f65d]' : 'bg-amber-400'}`} />
                      <span className="text-white/60 font-mono text-xs">#{o.order_number}</span>
                      <span className="text-white/30 text-xs">{o.locales?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs">
                        {new Date(o.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-white/70">{formatCOP(o.total_price)}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-8">Sin pedidos este día</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}