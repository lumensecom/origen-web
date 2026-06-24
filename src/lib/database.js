import { supabase } from './supabase'

// A customer's profile lives in `clientes`. Staff have no `clientes` row, so we
// use maybeSingle() and return null instead of throwing for them.
export async function getProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

// Staff identity (role + sede). Returns null for customers. `id_local` NULL = admin/global.
export async function getEmpleado(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
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

// Strip the leading "#" of the order code (and surrounding space) before it ever
// reaches the API. The "#" is display-only; sending it produced 400s when it was
// passed into an `id=eq.%23…` filter. The RPCs also sanitise server-side.
const cleanOrderNumber = (query) => String(query ?? '').replace(/#/g, '').trim()

// Admin order search. Calls the SECURITY DEFINER `admin_get_order` RPC, which
// matches by full UUID or the short #XXXXXXXX code (dashes/casing/"#" ignored)
// and is gated to admins server-side.
export async function adminSearchOrders(query) {
  if (!supabase) return []
  const { data, error } = await supabase
    .rpc('admin_get_order', { p_query: cleanOrderNumber(query) })
  if (error) throw error
  return data ?? []
}

// Seller order lookup (scan OR manual code). Sanitises the "#" then calls the
// `seller_get_order` RPC, which matches a full UUID or short prefix, scopes the
// result to the seller's own sede (location), and records the scan. This is the
// search path that replaced the malformed `id=eq.#XXXXXXXX` REST query.
export async function sellerSearchOrder(query) {
  if (!supabase) return []
  const { data, error } = await supabase
    .rpc('seller_get_order', { p_query: cleanOrderNumber(query) })
  if (error) throw error
  return data ?? []
}

// Seller order history. Returns only orders this caja has scanned/entered,
// filtered by status ('all' | 'scanned' | 'paid') and an ISO `since` timestamp.
export async function sellerListOrders({ status = 'all', since = null } = {}) {
  if (!supabase) return []
  const { data, error } = await supabase
    .rpc('seller_list_orders', { p_status: status, p_since: since })
  if (error) throw error
  return data ?? []
}

// Delete an order entirely (admin-only; enforced by the orders_delete_admin RLS policy).
export async function deleteOrder(orderId) {
  if (!supabase) return null
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
  if (error) throw error
  return true
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

// ---------------------------------------------------------------------------
// Locations (locales table — public SELECT)
// ---------------------------------------------------------------------------

export async function getLocales() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('locales')
    .select('id, name, direccion')
    .order('id')
  if (error) throw error
  return data ?? []
}

// ---------------------------------------------------------------------------
// Admin — user management
// ---------------------------------------------------------------------------

export async function adminListUsers() {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data ?? []
}

export async function adminCreateUser({ email, password, fullName, rol, idLocal }) {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sesión no encontrada')

  const res = await fetch('/api/admin-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email, password, full_name: fullName, rol, id_local: idLocal ?? null }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Error al crear usuario')
  return body
}

export async function adminDeleteUser(userId) {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sesión no encontrada')

  const res = await fetch('/api/admin-users', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ userId }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Error al eliminar usuario')
  return body
}

// ---------------------------------------------------------------------------
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
