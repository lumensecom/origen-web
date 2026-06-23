import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile, getEmpleado } from '../lib/database'
import { LOCALES } from '../constants/locations'

const AuthContext = createContext(null)

const localeName = (localId) =>
  LOCALES.find((l) => l.localId === localId)?.nombre ?? null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)   // clientes row (customers)
  const [empleado, setEmpleado] = useState(null) // empleados row (staff)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false) // password-recovery link was clicked

  // Staff identity is the source of truth for role/sede; customers fall back to
  // their `clientes` row. We resolve both so a single account can never be
  // mistaken for the other.
  const loadProfile = async (userId) => {
    try {
      const [p, e] = await Promise.all([
        getProfile(userId).catch(() => null),
        getEmpleado(userId).catch(() => null),
      ])
      setProfile(p)
      setEmpleado(e)
    } catch {
      setProfile(null)
      setEmpleado(null)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
        setUser(session?.user ?? null)
        return
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setEmpleado(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setEmpleado(null)
  }

  const resetPassword = async (email) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setIsRecovery(false)
    if (user) loadProfile(user.id)
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id)
  }

  // Staff (empleados) win over the customer fallback. A staff member is never a
  // customer and vice-versa.
  const role = empleado?.rol ?? profile?.role ?? 'customer'
  const isAdmin = role === 'admin'
  const isSeller = role === 'seller' || role === 'admin' // staff (has Caja access)
  const sellerLocalId = empleado?.id_local ?? null       // NULL for admin = global

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      empleado,
      loading,
      isAuthenticated: !!user,
      role,
      isStaff: !!empleado,
      isAdmin,
      isSeller,
      // A pure seller (caja) — used to redirect on login and block purchasing.
      isCajaSeller: role === 'seller',
      sellerLocalId,
      sellerLocation: localeName(sellerLocalId),
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isRecovery,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
