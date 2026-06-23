import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createOrder, addLoyaltyPoints, addPointsHistory, getOrderById, getOrderHistory,
} from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/format';

// ---------------------------------------------------------------------------
// Persistence — the cart and its checkout state survive reloads and WhatsApp
// hand-offs via localStorage. Orders are NEVER auto-cleared just because a link
// was opened; lines only leave the active cart when (A) the customer deletes
// them or (B) a seller marks the linked order entregado = true (synced below).
// ---------------------------------------------------------------------------
const CART_KEY = 'origen.cart.v1';
const CHECKOUT_KEY = 'origen.checkout.v1';
const EMPTY_CHECKOUT = { unlocked: false, store: null, masterOrderId: null, masterSig: null };

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// Lightweight signature so we can reuse an already-generated QR/order when the
// underlying cart hasn't changed, instead of spawning a duplicate order row.
const lineSig = (l) => `${l.id}:${l.quantity}:${l.precio}`;
const cartSig = (lines) => lines.map(lineSig).join('|');

// Normalises a cart line into the shape we persist in orders.items (jsonb).
// Builder bowls keep ALL selections so the admin dashboard can analyse
// best/least-selling ingredients, not just base + proteína.
const buildItemsData = (items) =>
  items.map(item => ({
    id: item.id,
    nombre: item.nombre,
    precio: item.precio,
    quantity: item.quantity,
    ...(item.desc ? { desc: item.desc, emoji: item.emoji ?? null } : {}),
    ...(item.esBuilder
      ? {
          esBuilder: true,
          base: item.base,
          frescuras: item.frescuras ?? [],
          sabores: item.sabores ?? [],
          proteina: item.proteina,
          salsa: item.salsa,
        }
      : {}),
  }));

export const useCart = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [cart, setCart] = useState(() => loadJSON(CART_KEY, []));
  const [checkout, setCheckout] = useState(() => loadJSON(CHECKOUT_KEY, EMPTY_CHECKOUT));

  // Mirror state into refs so the realtime callback always reads fresh values.
  const checkoutRef = useRef(checkout);
  useEffect(() => { checkoutRef.current = checkout; }, [checkout]);

  // Persist on every change.
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* quota */ } }, [cart]);
  useEffect(() => { try { localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkout)); } catch { /* quota */ } }, [checkout]);

  // When the cart empties, drop the QR-unlocked state so a fresh order starts clean.
  useEffect(() => {
    if (cart.length === 0 && checkout.unlocked) setCheckout(EMPTY_CHECKOUT);
  }, [cart.length, checkout.unlocked]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (product, change) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== product.id) return item;
        const newQty = item.quantity + change;
        // Quantity change invalidates any QR already generated for this line.
        return newQty > 0 ? { ...item, quantity: newQty, paidOrderId: undefined, paidSig: undefined } : item;
      })
    );
  };

  const removeItem = (product) => {
    setCart(prev => prev.filter(item => item.id !== product.id));
  };

  const clearCart = () => {
    setCart([]);
    setCheckout(EMPTY_CHECKOUT);
  };

  // Replace a cart line in place, keeping its id + quantity. Used by the
  // "Editar pedido" flow so an edited bowl updates the current line instead of
  // appending a new one.
  const replaceItem = (lineId, newProduct) => {
    setCart(prev =>
      prev.map(item =>
        item.id === lineId
          ? { ...newProduct, id: lineId, quantity: item.quantity, paidOrderId: undefined, paidSig: undefined }
          : item
      )
    );
  };

  // -------------------------------------------------------------------------
  // entregado sync — remove paid lines from the active cart.
  // A seller scanning a QR and flipping entregado = true removes the matching
  // line(s) here, in realtime and on (re)load.
  // -------------------------------------------------------------------------
  const pruneDeliveredOrder = (orderId, entregado) => {
    if (!entregado || !orderId) return;
    if (checkoutRef.current.masterOrderId === orderId) {
      // The whole order was paid at the counter → empty the active cart.
      setCart([]);
      setCheckout(EMPTY_CHECKOUT);
      return;
    }
    setCart(prev => prev.filter(item => item.paidOrderId !== orderId));
  };

  // Realtime: a seller paying a scanned QR flips entregado → prune instantly.
  useEffect(() => {
    if (!supabase || !user) return undefined;
    const channel = supabase
      .channel(`cart-orders-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => pruneDeliveredOrder(payload.new?.id, payload.new?.entregado)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // On (re)load / login, reconcile against orders already delivered while away.
  useEffect(() => {
    if (!supabase || !user) return undefined;
    let active = true;
    getOrderHistory(user.id)
      .then(orders => {
        if (!active) return;
        orders.filter(o => o.entregado).forEach(o => pruneDeliveredOrder(o.id, true));
      })
      .catch(() => {});
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // -------------------------------------------------------------------------
  // QR payment — only reachable once the cart is "unlocked" (pickup + store +
  // WhatsApp confirmation, gated in the UI). Each call persists a real orders
  // row (entregado = false) and returns it so the UI can render its QR.
  // -------------------------------------------------------------------------
  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      throw new Error('Inicia sesión para generar el QR de tu pedido.');
    }
  };

  // Pickup orders are channel='pickup' and MUST carry a valid sede (local_id):
  // the seller's RLS only lets them see/charge orders of their own sede, so a
  // QR without local_id would be invisible in the Caja. Enforced in the DB too
  // (orders_pickup_requires_local).
  const requirePickupStore = () => {
    if (!checkout.store?.localId) {
      throw new Error('Selecciona una sede para recoger antes de generar el QR.');
    }
  };

  // Master QR: one order for the entire cart. Reused while the cart is unchanged.
  const payAll = async () => {
    requireAuth();
    requirePickupStore();
    const sig = cartSig(cart);
    if (checkout.masterOrderId && checkout.masterSig === sig) {
      try {
        const existing = await getOrderById(checkout.masterOrderId);
        if (existing && !existing.entregado) return existing;
      } catch { /* fall through and recreate */ }
    }
    const total = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    const order = await createOrder({
      user_id: user.id,
      items: buildItemsData(cart),
      total_price: total,
      channel: 'pickup',                       // canal: sede física
      source: 'app',
      status: 'recibido',
      local_id: checkout.store.localId,        // sede obligatoria (validada arriba)
      delivery_type: 'En Local (QR)',
      store_location: checkout.store?.nombre ?? null,
      delivery_address: null,
      delivery_details: null,
    });
    setCheckout(prev => ({ ...prev, masterOrderId: order.id, masterSig: sig }));
    return order;
  };

  // Individual QR: one order for a single cart line. Reused while that line is
  // unchanged, so re-opening its QR doesn't spawn duplicate rows.
  const payItem = async (line) => {
    requireAuth();
    requirePickupStore();
    const sig = lineSig(line);
    if (line.paidOrderId && line.paidSig === sig) {
      try {
        const existing = await getOrderById(line.paidOrderId);
        if (existing && !existing.entregado) return existing;
      } catch { /* fall through and recreate */ }
    }
    const order = await createOrder({
      user_id: user.id,
      items: buildItemsData([line]),
      total_price: line.precio * line.quantity,
      channel: 'pickup',                       // canal: sede física
      source: 'app',
      status: 'recibido',
      local_id: checkout.store.localId,        // sede obligatoria (validada arriba)
      delivery_type: 'En Local (QR) — Ítem',
      store_location: checkout.store?.nombre ?? null,
      delivery_address: null,
      delivery_details: null,
    });
    setCart(prev => prev.map(item =>
      item.id === line.id ? { ...item, paidOrderId: order.id, paidSig: sig } : item
    ));
    return order;
  };

  // -------------------------------------------------------------------------
  // WhatsApp confirmation. For pickup this also UNLOCKS in-store QR payment and
  // keeps the cart intact; for delivery it persists the order. Neither path
  // clears the cart — only a manual delete or a seller payment does that.
  // -------------------------------------------------------------------------
  const confirmOrder = async (deliveryData) => {
    const cartTotal = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    const isPickup = deliveryData.modalidad === 'Recoger en Local';

    // Validate the channel selection up front (the UI also gates the buttons).
    // pickup → a valid sede; delivery (online) → address + contact phone.
    if (isPickup && !deliveryData.store?.localId) {
      throw new Error('Selecciona una sede para recoger.');
    }
    if (!isPickup && (!deliveryData.direccion?.trim() || !deliveryData.telefono?.trim())) {
      throw new Error('Para domicilio necesitamos dirección y teléfono de contacto.');
    }

    if (isAuthenticated && user) {
      try {
        // Delivery orders have no in-store QR step, so they're persisted here as
        // channel='delivery' (online). Pickup orders are persisted later when a
        // QR is generated (payAll/payItem).
        if (!isPickup) {
          await createOrder({
            user_id: user.id,
            items: buildItemsData(cart),
            total_price: cartTotal,
            channel: 'delivery',                 // canal: pedido remoto / online
            source: 'app',                       // origen (futuro: 'rappi', 'didi'…)
            status: 'recibido',
            local_id: null,
            delivery_type: deliveryData.modalidad,
            store_location: null,
            customer_name: deliveryData.nombre ?? null,
            customer_phone: deliveryData.telefono ?? null,
            delivery_address: deliveryData.direccion ?? null,
            delivery_zone: deliveryData.zona ?? null,
            delivery_details: deliveryData.detalles ?? null,
          });
        }
        await addLoyaltyPoints(user.id, 50);
        await addPointsHistory(user.id, 50, `Compra por ${formatPrice(cartTotal)}`);
        await refreshProfile();
      } catch (err) {
        console.error('Error guardando pedido en Supabase:', err);
      }
    }

    let orderText = `🌿 *NUEVO PEDIDO ORIGEN* 🌿\n----------------------------------\n`;
    const bowls = cart.filter(item => !item.desc);
    const bebidas = cart.filter(item => item.desc);

    if (bowls.length > 0) {
      orderText += `🥣 *BOWL(S):*\n`;
      bowls.forEach(b => {
        orderText += `• ${b.quantity}x ${b.nombre} (${formatPrice(b.precio * b.quantity)})\n`;
        if (b.esBuilder) {
          orderText += `  (Base: ${b.base} | Frescuras: ${b.frescuras.join(', ')} | Proteína: ${b.proteina})\n`;
        }
      });
      orderText += `\n`;
    }
    if (bebidas.length > 0) {
      orderText += `🍹 *BEBIDA(S):*\n`;
      bebidas.forEach(beb => {
        orderText += `• ${beb.quantity}x ${beb.nombre} (${formatPrice(beb.precio * beb.quantity)})\n`;
      });
      orderText += `\n`;
    }

    orderText += `----------------------------------\n`;
    orderText += `📍 *MODALIDAD:* ${deliveryData.modalidad}\n`;
    if (isPickup) {
      orderText += `🏪 *SEDE SELECCIONADA:* ${deliveryData.store?.nombre}\n`;
      orderText += `📍 *DIRECCIÓN SEDE:* ${deliveryData.store?.direccion}\n`;
    } else {
      orderText += `🏠 *ENTREGAR EN:* ${deliveryData.direccion}\n`;
      if (deliveryData.zona) orderText += `🗺️ *ZONA / BARRIO:* ${deliveryData.zona}\n`;
      if (deliveryData.telefono) orderText += `📞 *CONTACTO:* ${deliveryData.telefono}\n`;
      if (deliveryData.detalles) orderText += `📝 *INDICACIONES:* ${deliveryData.detalles}\n`;
    }
    orderText += `----------------------------------\n`;
    orderText += `💰 *TOTAL A PAGAR:* ${formatPrice(cartTotal)}\n`;
    orderText += `----------------------------------\n¡Preparar al instante con amor real! 🌿`;

    window.open(`https://wa.me/573103112799?text=${encodeURIComponent(orderText)}`, '_blank');

    // Pickup: unlock in-store QR payment and keep the cart visible. NEVER clear it.
    if (isPickup) {
      setCheckout(prev => ({ ...prev, unlocked: true, store: deliveryData.store ?? null }));
    }
  };

  return {
    cart,
    checkout,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    replaceItem,
    confirmOrder,
    payAll,
    payItem,
  };
};
