// src/components/StaffPortal.jsx
// ÚNICO punto de entrada del módulo de staff. Detecta el rol del
// usuario logueado (cajero / admin_general) y muestra el panel
// que le corresponde. Es el único componente nuevo que necesitas
// montar en tu app — no toca nada más de la página existente.
//
// Uso (donde ya manejas la sesión de Supabase):
//   {session && <StaffPortal user={session.user} />}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import PaymentScanner from './PaymentScanner'
import AdminGeneralPanel from './AdminGeneralPanel'

export default function StaffPortal({ user }) {
  const role = user?.app_metadata?.role
  const localeId = user?.app_metadata?.locale_id
  const [localeName, setLocaleName] = useState('')

  useEffect(() => {
    if (role === 'cajero' && localeId) {
      supabase
        .from('locales')
        .select('name')
        .eq('id', localeId)
        .single()
        .then(({ data }) => setLocaleName(data?.name ?? ''))
    }
  }, [role, localeId])

  if (role === 'cajero') {
    return <PaymentScanner localeId={localeId} localeName={localeName} />
  }

  if (role === 'admin_general') {
    return <AdminGeneralPanel user={user} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <p className="text-white/30 text-sm text-center">Esta cuenta no tiene acceso al panel de staff.</p>
    </div>
  )
}