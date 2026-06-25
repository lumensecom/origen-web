import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { orderId } = req.body ?? {}
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY

  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Supabase env vars not configured' })
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' })

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const resend = new Resend(resendKey)

  // Fetch order
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  if (orderErr || !order) return res.status(404).json({ error: 'Order not found' })

  // Fetch customer email from auth
  const { data: authData, error: authErr } = await admin.auth.admin.getUserById(order.user_id)
  if (authErr || !authData?.user?.email) return res.status(400).json({ error: 'Cannot get customer email' })
  const email = authData.user.email

  // Fetch customer name from clientes table
  const { data: profile } = await admin
    .from('clientes')
    .select('full_name')
    .eq('id', order.user_id)
    .maybeSingle()

  const nombre = profile?.full_name || email.split('@')[0]
  const items = Array.isArray(order.items) ? order.items : []
  const shortId = String(order.id).slice(0, 8).toUpperCase()
  const location = order.store_location || order.delivery_address || 'Local Origen'

  const itemsRows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 12px;font-size:14px;color:#1B4332;font-family:Arial,sans-serif;">
          ${it.quantity}× ${it.nombre}
        </td>
        <td style="padding:8px 12px;font-size:14px;color:#1B4332;font-family:Arial,sans-serif;text-align:right;">
          ${fmt((it.precio ?? 0) * (it.quantity ?? 1))}
        </td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F4EA;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F4EA;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1B4332;padding:36px 40px 32px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6EE7B7;font-weight:700;">ORIGEN</p>
            <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:800;line-height:1.2;">
              ✅ Pedido confirmado
            </h1>
            <p style="margin:8px 0 0;font-size:15px;color:#A7F3D0;">
              Hola ${nombre}, ya lo estamos preparando 🥦
            </p>
          </td>
        </tr>
        <!-- Order ID -->
        <tr>
          <td style="padding:28px 40px 0;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;">Pedido</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#1B4332;letter-spacing:2px;">#${shortId}</p>
          </td>
        </tr>
        <!-- Items -->
        <tr>
          <td style="padding:20px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #F1F4EA;">
              <tr>
                <th style="padding:8px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6B7280;text-align:left;font-weight:700;">Producto</th>
                <th style="padding:8px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6B7280;text-align:right;font-weight:700;">Total</th>
              </tr>
              ${itemsRows}
            </table>
          </td>
        </tr>
        <!-- Total -->
        <tr>
          <td style="padding:16px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1B4332;">
              <tr>
                <td style="padding:12px 12px;font-size:15px;font-weight:700;color:#1B4332;">Total a pagar</td>
                <td style="padding:12px 12px;font-size:20px;font-weight:800;color:#C9A227;text-align:right;">${fmt(order.total_price ?? 0)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Location -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#F1F4EA;border-radius:14px;padding:16px 20px;">
              <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;font-weight:700;">📍 Dónde recoger / entregar</p>
              <p style="margin:6px 0 0;font-size:15px;color:#1B4332;font-weight:600;">${location}</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:32px 40px 36px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#9CA3AF;">¿Preguntas? Escríbenos en Instagram <strong>@soyorigen</strong></p>
            <p style="margin:12px 0 0;font-size:11px;color:#D1D5DB;">© 2026 ORIGEN Bowls · Bogotá, Colombia</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { error: emailErr } = await resend.emails.send({
    from: 'ORIGEN <noreply@soyorigen.co>',
    to: email,
    subject: `Tu pedido ORIGEN está confirmado 🥦 — #${shortId}`,
    html,
  })

  if (emailErr) {
    console.error('Resend error:', emailErr)
    return res.status(500).json({ error: 'Failed to send email', detail: emailErr.message })
  }

  return res.status(200).json({ success: true, to: email })
}
