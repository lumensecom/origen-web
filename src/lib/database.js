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
