import { useState, useEffect, useMemo, useCallback } from 'react';
import { getOrdersForAnalytics } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { CARTA, INGREDIENTE_COLORES } from '../../constants/menu';

// Universes so "least sold" includes items/ingredients that never sold (count 0)
const DISH_UNIVERSE = [
  ...CARTA.map(b => b.nombre),
  'BOWL PERSONALIZADO',
  'BOWL MÁXIMO PERSONALIZADO',
];
const INGREDIENT_UNIVERSE = Object.keys(INGREDIENTE_COLORES);

const locationKey = (o) =>
  o.store_location || (o.delivery_type === 'Domicilio' ? 'Domicilio' : 'En local (QR)');

function computeMetrics(orders, hour) {
  const base = orders;
  const narrowed = hour === '' || hour == null
    ? base
    : base.filter(o => o.created_at && new Date(o.created_at).getHours() === Number(hour));

  // Sales by location (narrowed)
  const byLocation = {};
  narrowed.forEach(o => {
    const k = locationKey(o);
    if (!byLocation[k]) byLocation[k] = { value: 0, count: 0 };
    byLocation[k].value += o.total_price || 0;
    byLocation[k].count += 1;
  });

  // Peak hours — always from the date/location-filtered set (ignores hour filter)
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, sales: 0 }));
  base.forEach(o => {
    if (!o.created_at) return;
    const h = new Date(o.created_at).getHours();
    hours[h].count += 1;
    hours[h].sales += o.total_price || 0;
  });

  // Dishes + ingredients (narrowed), zero-filled from the universes
  const dishCounts = Object.fromEntries(DISH_UNIVERSE.map(n => [n, 0]));
  const ingCounts = Object.fromEntries(INGREDIENT_UNIVERSE.map(n => [n, 0]));
  narrowed.forEach(o => {
    (Array.isArray(o.items) ? o.items : []).forEach(it => {
      const q = it.quantity || 1;
      if (it.nombre) dishCounts[it.nombre] = (dishCounts[it.nombre] || 0) + q;
      if (it.esBuilder) {
        [it.base, it.proteina, it.salsa].forEach(n => { if (n) ingCounts[n] = (ingCounts[n] || 0) + q; });
        (it.frescuras || []).forEach(n => { if (n) ingCounts[n] = (ingCounts[n] || 0) + q; });
        (it.sabores || []).forEach(n => { if (n) ingCounts[n] = (ingCounts[n] || 0) + q; });
      }
    });
  });

  const sortDesc = (obj) =>
    Object.entries(obj).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const dishes = sortDesc(dishCounts);
  const ingredients = sortDesc(ingCounts);

  const totalSales = narrowed.reduce((a, o) => a + (o.total_price || 0), 0);
  const totalOrders = narrowed.length;

  return {
    totalSales,
    totalOrders,
    avgTicket: totalOrders ? Math.round(totalSales / totalOrders) : 0,
    delivered: narrowed.filter(o => o.entregado).length,
    locations: Object.entries(byLocation)
      .map(([label, v]) => ({ label, value: v.value, count: v.count }))
      .sort((a, b) => b.value - a.value),
    hours,
    topDishes: dishes.slice(0, 6),
    bottomDishes: dishes.slice(-6).reverse(),
    topIngredients: ingredients.slice(0, 8),
    bottomIngredients: ingredients.slice(-8).reverse(),
  };
}

// Fetches orders for the active filters (date range + location server-side),
// recomputes metrics, and live-refreshes via Supabase realtime on `orders`.
export function useAnalytics(filters) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { fromDate, toDate, location, hour } = filters;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined;
      const to = toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined;
      const data = await getOrdersForAnalytics({ from, to, location: location || undefined });
      setOrders(data);
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, location]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: any insert/update/delete on orders refreshes the dashboard.
  useEffect(() => {
    if (!supabase) return undefined;
    const channel = supabase
      .channel('orders-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const metrics = useMemo(() => computeMetrics(orders, hour), [orders, hour]);

  return { loading, error, orders, metrics, refresh: fetchData };
}
