import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile, getEmpleado } from '../lib/database'

const AuthContext = createContext(null)

// id_local → display name (must match locales.name exactly)
const LOCAL_NAMES = {
  1: 'CC salitre Plaza',
  2: 'CC av chile',
  3: 'CC Nuestro Bogota',
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)   // clientes row
  const [empleado, setEmpleado] = useState(null) // empleados row
  const [loading, setLoading] = useState(true)

  const loadIdentity = async (userId) => {
    try {
      const [prof, emp] = await Promise.all([
        getProfile(userId),
        getEmpleado(userId),
      ])
      setProfile(prof)
      setEmpleado(emp)
    } catch {
      setProfile(null)
      setEmpleado(null)
    }
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadIdentity(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadIdentity(session.user.id)
      } else {
        setProfile(null)
        setEmpleado(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Role derivation — empleados row always wins over clientes row
  const role          = empleado?.rol ?? profile?.role ?? 'customer'
  const isStaff       = !!empleado
  const isAdmin       = role === 'admin'
  const isSeller      = role === 'seller' || role === 'admin'
  const isCajaSeller  = role === 'seller'
  const sellerLocalId = empleado?.id_local ?? null
  const sellerLocation = sellerLocalId ? LOCAL_NAMES[sellerLocalId] : null

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
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const refreshProfile = async () => {
    if (user) await loadIdentity(user.id)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      empleado,
      loading,
      isAuthenticated: !!user,
      role,
      isStaff,
      isAdmin,
      isSeller,
      isCajaSeller,
      sellerLocalId,
      sellerLocation,
      signIn,
      signUp,
      signOut,
      resetPassword,
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
