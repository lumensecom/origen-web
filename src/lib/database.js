import { supabase } from './supabase'

export async function getProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function addLoyaltyPoints(userId, pointsToAdd) {
  if (!supabase) return null
  const { data, error } = await supabase
    .rpc('add_loyalty_points', { p_user_id: userId, p_points: pointsToAdd })
  if (error) throw error
  return data
}

export async function addPointsHistory(userId, pointsChanged, description) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('points_history')
    .insert({ user_id: userId, points_changed: pointsChanged, description })
  if (error) throw error
  return data
}

export async function createOrder(orderPayload) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getOrderHistory(userId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Fetch a single order by its UUID — used by the seller after scanning a QR
export async function getOrderById(orderId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

// Update an existing order in place (used by the "Editar pedido" flow so the
// edit replaces the current order instead of creating a new one)
export async function updateOrder(orderId, patch) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Flip the delivery status (Pagar / Deshacer). Goes through the SECURITY DEFINER
// RPC so only seller/admin can change it, and only the `entregado` column moves.
export async function setOrderDelivered(orderId, value) {
  if (!supabase) return null
  const { data, error } = await supabase
    .rpc('set_order_delivered', { p_order_id: orderId, p_value: value })
  if (error) throw error
  return data
}

// Admin analytics feed. RLS grants admins global read; filters are applied
// server-side so the dashboard only pulls what the active filters need.
export async function getOrdersForAnalytics({ from, to, location } = {}) {
  if (!supabase) return []
  let query = supabase.from('orders').select('*')
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  if (location) query = query.eq('store_location', location)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
