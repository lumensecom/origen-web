import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder, addLoyaltyPoints, addPointsHistory } from '../../lib/database';
import { formatPrice } from '../../utils/format';

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
  const [cart, setCart] = useState([]);

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
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      })
    );
  };

  const removeItem = (product) => {
    setCart(prev => prev.filter(item => item.id !== product.id));
  };

  // Replace a cart line in place, keeping its id + quantity. Used by the
  // "Editar pedido" flow so an edited bowl updates the current line instead of
  // appending a new one.
  const replaceItem = (lineId, newProduct) => {
    setCart(prev =>
      prev.map(item =>
        item.id === lineId ? { ...newProduct, id: lineId, quantity: item.quantity } : item
      )
    );
  };

  // Persist the current cart as a pending order (entregado = false) and return
  // the saved row (with its real UUID) so the cart can render a QR for the
  // customer to pay in store. Requires auth (RLS: user can only insert own).
  const saveOrderForPickup = async () => {
    if (!isAuthenticated || !user) {
      throw new Error('Inicia sesión para generar el QR de tu pedido.');
    }
    const cartTotal = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    const order = await createOrder({
      user_id: user.id,
      items: buildItemsData(cart),
      total_price: cartTotal,
      delivery_type: 'En Local (QR)',
      store_location: null,
      delivery_address: null,
      delivery_details: null,
    });
    setCart([]);
    return order;
  };

  const confirmOrder = async (deliveryData) => {
    const cartTotal = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);

    if (isAuthenticated && user) {
      try {
        await createOrder({
          user_id: user.id,
          items: buildItemsData(cart),
          total_price: cartTotal,
          delivery_type: deliveryData.modalidad,
          store_location: deliveryData.modalidad === 'Recoger en Local' ? deliveryData.store?.nombre : null,
          delivery_address: deliveryData.modalidad === 'Domicilio' ? deliveryData.direccion : null,
          delivery_details: deliveryData.detalles ?? null,
        });
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
    if (deliveryData.modalidad === 'Recoger en Local') {
      orderText += `🏪 *SEDE SELECCIONADA:* ${deliveryData.store?.nombre}\n`;
      orderText += `📍 *DIRECCIÓN SEDE:* ${deliveryData.store?.direccion}\n`;
    } else {
      orderText += `🏠 *ENTREGAR EN:* ${deliveryData.direccion}\n`;
      if (deliveryData.detalles) orderText += `📝 *INDICACIONES:* ${deliveryData.detalles}\n`;
    }
    orderText += `----------------------------------\n`;
    orderText += `💰 *TOTAL A PAGAR:* ${formatPrice(cartTotal)}\n`;
    orderText += `----------------------------------\n¡Preparar al instante con amor real! 🌿`;

    window.open(`https://wa.me/573103112799?text=${encodeURIComponent(orderText)}`, '_blank');
    setCart([]);
  };

  return { cart, addToCart, updateQty, removeItem, replaceItem, saveOrderForPickup, confirmOrder };
};
