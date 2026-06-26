import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// useOrderNotifications — global, app-wide alerts for the Caja (seller).
//
// When a customer creates a pickup order for THIS seller's sede, the operator
// gets an immediate alert: a sound chime, a haptic vibration (where supported)
// and an entry that drives the navbar bell + the floating toasts.
//
// Two realtime sources, deduplicated by order id so a given order never alerts
// twice:
//   1. BROADCAST (primary) — dispatched by the DB trigger `broadcast_new_order`
//      to the private topic `sede:<local_id>`; realtime.messages RLS scopes
//      receipt to this sede only. See base_correcta.txt → Sección 16.
//   2. postgres_changes (safety net) — INSERT on `orders` filtered by local_id.
//      Keeps alerts working even before the SQL trigger/RLS is applied.
// ---------------------------------------------------------------------------

// Soft two-tone chime via the Web Audio API (no audio asset needed).
const playChime = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const beep = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    beep(880, 0, 0.18);
    beep(1100, 0.2, 0.22);
  } catch { /* autoplay policy / audio blocked — ignore */ }
};

// Haptic feedback, guarded so it NEVER throws. iOS Safari has no Vibration API
// (navigator.vibrate is undefined) → the typeof check skips it; Android honours
// it. Wrapped in try/catch in case a browser exposes it but blocks the call.
const vibrate = (pattern) => {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch { /* unsupported / blocked — ignore */ }
};

const MAX_NOTIFS = 30;

export function useOrderNotifications({ localId, enabled } = {}) {
  const [notifications, setNotifications] = useState([]);
  const seenRef = useRef(new Set()); // dedupe across broadcast + postgres_changes

  // Normalises either payload shape (broadcast `order_id` / CDC row `id`) and
  // alerts once per order.
  const pushOrder = useCallback((o) => {
    const orderId = o?.order_id ?? o?.id;
    if (!orderId || seenRef.current.has(orderId)) return;
    seenRef.current.add(orderId);
    // Keep the dedupe set from growing without bound over a long shift.
    if (seenRef.current.size > 500) seenRef.current = new Set([orderId]);

    playChime();
    vibrate([120, 60, 120]);

    setNotifications(prev => [{
      orderId,
      total: o.total_price ?? 0,
      items: Array.isArray(o.items) ? o.items : [],
      ts: new Date(o.created_at || Date.now()),
      read: false,
    }, ...prev].slice(0, MAX_NOTIFS));
  }, []);

  useEffect(() => {
    if (!supabase || !enabled || !localId) return undefined;
    let cancelled = false;
    const topic = `sede:${localId}`;

    // Primary: broadcast dispatched by the DB trigger. Private channel → the
    // realtime.messages RLS authorises only this sede's caja. If auth/setup
    // isn't ready, this degrades silently and the CDC net below still alerts.
    let broadcastChannel;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await supabase.realtime.setAuth(data?.session?.access_token); // enable private channels
      } catch { /* fall through to CDC */ }
      if (cancelled) return;
      broadcastChannel = supabase
        .channel(topic, { config: { private: true } })
        .on('broadcast', { event: 'new_order' }, ({ payload }) => pushOrder(payload || {}))
        .subscribe();
    })();

    // Safety net: postgres_changes for this sede, deduped by order id.
    const cdcChannel = supabase
      .channel(`orders-insert-${localId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `local_id=eq.${localId}` },
        (payload) => pushOrder(payload.new || {}),
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (broadcastChannel) supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(cdcChannel);
    };
  }, [enabled, localId, pushOrder]);

  const unreadCount = notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0);

  const markAllRead = useCallback(
    () => setNotifications(prev => (prev.some(n => !n.read) ? prev.map(n => ({ ...n, read: true })) : prev)),
    [],
  );
  const dismissOne = useCallback(
    (orderId) => setNotifications(prev => prev.filter(n => n.orderId !== orderId)),
    [],
  );
  const clearAll = useCallback(() => setNotifications([]), []);

  return { notifications, unreadCount, markAllRead, dismissOne, clearAll };
}
