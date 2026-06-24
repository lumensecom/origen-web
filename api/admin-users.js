import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key (never sent to the browser).
// Required Vercel env vars:
//   VITE_SUPABASE_URL           — same URL as the frontend var
//   SUPABASE_SERVICE_ROLE_KEY   — from Supabase → Project Settings → API → service_role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifyAdmin(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  const { data: emp } = await supabaseAdmin
    .from('empleados')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle()

  return emp?.rol === 'admin' ? user : null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const caller = await verifyAdmin(req.headers.authorization)
  if (!caller) return res.status(403).json({ error: 'Acceso restringido a administradores' })

  // POST /api/admin-users → create a new user
  if (req.method === 'POST') {
    const { email, password, full_name, rol, id_local } = req.body ?? {}

    if (!email || !password || !rol)
      return res.status(400).json({ error: 'email, password y rol son obligatorios' })
    if (!['customer', 'seller', 'admin'].includes(rol))
      return res.status(400).json({ error: 'rol debe ser customer, seller o admin' })
    if (rol === 'seller' && !id_local)
      return res.status(400).json({ error: 'Los vendedores deben tener una sede asignada' })

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? '' },
    })
    if (createErr) return res.status(400).json({ error: createErr.message })

    const userId = created.user.id

    if (rol === 'seller' || rol === 'admin') {
      const { error: empErr } = await supabaseAdmin.from('empleados').insert({
        id: userId,
        rol,
        id_local: rol === 'admin' ? null : id_local,
      })
      if (empErr) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return res.status(500).json({ error: `Error al crear empleado: ${empErr.message}` })
      }
    }

    return res.status(201).json({ user: created.user })
  }

  // DELETE /api/admin-users → delete a user (cascades to clientes/empleados)
  if (req.method === 'DELETE') {
    const { userId } = req.body ?? {}
    if (!userId) return res.status(400).json({ error: 'userId es obligatorio' })

    if (userId === caller.id)
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (delErr) return res.status(400).json({ error: delErr.message })

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
