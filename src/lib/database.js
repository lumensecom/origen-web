import { supabase } from './supabase'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function cleanOrderNumber(raw) {
  return (raw ?? '').replace(/[#\-\s]/g, '').trim()
}

// ---------------------------------------------------------------------------
// Customer identity (clientes table)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Staff identity (empleados table)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Loyalty
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

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

/**
 * List all platform users via the admin_list_users() SECURITY DEFINER RPC.
 * Only succeeds when the caller has rol='admin' in empleados.
 * Returns: { id, email, created_at, tipo, rol, nombre, loyalty_points, id_local, local_name }[]
 */
export async function adminListUsers() {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data ?? []
}

/**
 * Create a new platform user via the /api/admin-users serverless endpoint.
 * Requires a valid admin session (Bearer token forwarded to the API).
 */
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

/**
 * Delete a platform user (auth + cascades to clientes/empleados) via the serverless endpoint.
 */
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
// Admin — order management (from existing RPCs)
// ---------------------------------------------------------------------------

export async function adminSearchOrders(query) {
  if (!supabase) return null
  const clean = cleanOrderNumber(query)
  const { data, error } = await supabase.rpc('admin_get_order', { p_query: clean })
  if (error) throw error
  return data
}
