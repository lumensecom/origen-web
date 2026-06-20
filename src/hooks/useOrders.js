// src/hooks/useOrders.js
// Hook central: locales, crear pedido, pagar (cajero), editar items,
// "Mis pedidos" del cliente y consultas del panel admin_general.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Locales ──────────────────────────────────────────────────────
export function useLocales() {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('locales')
      .select('id, name, direccion')
      .eq('activo', true)
      .order('name')
      .then(({ data, error }) => {
        if (!error) setLocales(data ?? [])
        setLoading(false)
      })
  }, [])

  return { locales, loading }
}

// ─── Crear pedido (queda pagado=false hasta que el cajero lo cobre) ─
export async function createOrder({
  userId, items, totalPrice, deliveryType, localeId, deliveryAddress, deliveryDetails,
}) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      items,
      total_price: totalPrice,
      delivery_type: deliveryType,
      locale_id: deliveryType === 'recoger' ? localeId : null,
      delivery_address: deliveryType === 'domicilio' ? deliveryAddress : null,
      delivery_details: deliveryType === 'domicilio' ? deliveryDetails : null,
    })
    .select('id, order_number, locale_id')
    .single()

  if (error) throw error
  return { order }
}

// ─── Pedido por ID (escáner de caja) ──────────────────────────────
export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, items, total_price, delivery_type,
      pagado, created_at, locale_id,
      locales ( name, direccion ),
      profiles ( full_name, email )
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

// ─── Marcar como pagado ────────────────────────────────────────────
// Todo (validar local, sumar puntos, registrar historial) pasa en una
// sola función de base de datos (mark_order_paid) para que sea atómico
// y no choque con RLS al escribir puntos de OTRO usuario (el cliente).
export async function markAsPaid(orderId) {
  const { data, error } = await supabase.rpc('mark_order_paid', { p_order_id: orderId })
  if (error) throw error
  return data
}

// ─── Editar items de un pedido (antes de pagar) ───────────────────
export async function updateOrderItems(orderId, items, totalPrice) {
  const { data, error } = await supabase
    .from('orders')
    .update({ items, total_price: totalPrice })
    .eq('id', orderId)
    .select(`
      id, order_number, items, total_price, delivery_type,
      pagado, created_at, locale_id,
      locales ( name, direccion ),
      profiles ( full_name, email )
    `)
    .single()

  if (error) throw error
  return data
}

// ─── Pedidos del cliente actual ("Mis pedidos") ───────────────────
export function useMyOrders(userId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, items, total_price, delivery_type,
        pagado, created_at, delivery_address, locale_id,
        locales ( name, direccion )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}

// ─── Pedidos de un día específico (panel admin_general) ───────────
// dateStr en formato 'YYYY-MM-DD'. localeId = null → todos los locales.
export function useDailyOrders(dateStr, localeId = null) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const start = `${dateStr}T00:00:00`
    const end = `${dateStr}T23:59:59.999`

    let query = supabase
      .from('orders')
      .select(`
        id, order_number, items, total_price, delivery_type,
        pagado, created_at, locale_id,
        locales ( name )
      `)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true })

    if (localeId) query = query.eq('locale_id', localeId)

    const { data, error } = await query
    if (!error) setOrders(data ?? [])
    setLoading(false)
  }, [dateStr, localeId])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}
