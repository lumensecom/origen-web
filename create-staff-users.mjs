import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gabcgejrrhkdrpdzzysk.supabase.cocls'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  console.error('   Ejemplo: SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/create-staff-users.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Edita emails y passwords antes de correr el script ───────────
// (cambia las contraseñas apenas el cajero/admin inicie sesión la primera vez)
const STAFF = [
  { email: 'cajero.a@origen-staff.com',     password: 'Origen2026!LocalA', role: 'cajero',        localeName: 'Local A' },
  { email: 'cajero.b@origen-staff.com',     password: 'Origen2026!LocalB', role: 'cajero',        localeName: 'Local B' },
  { email: 'cajero.c@origen-staff.com',     password: 'Origen2026!LocalC', role: 'cajero',        localeName: 'Local C' },
  { email: 'admin.general@origen-staff.com', password: 'Origen2026!Admin', role: 'admin_general', localeName: null },
]

async function run() {
  const { data: locales, error: localesError } = await supabase.from('locales').select('id, name')
  if (localesError) {
    console.error('Error leyendo locales:', localesError.message)
    process.exit(1)
  }

  for (const staff of STAFF) {
    const locale = staff.localeName ? locales.find((l) => l.name === staff.localeName) : null
    if (staff.localeName && !locale) {
      console.error(`⚠️  No encontré el local "${staff.localeName}". Corre primero origen-pedidos-migration-v2.sql`)
      continue
    }

    const app_metadata = locale
      ? { role: staff.role, locale_id: locale.id }
      : { role: staff.role }

    const { error } = await supabase.auth.admin.createUser({
      email: staff.email,
      password: staff.password,
      email_confirm: true,
      app_metadata,
    })

    if (error) {
      console.error(`❌ ${staff.email}:`, error.message)
    } else {
      console.log(`✅ Creado: ${staff.email} (${staff.role}${locale ? ' — ' + locale.name : ''})`)
    }
  }
}

run()
