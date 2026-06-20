-- ============================================================
-- ORIGEN — Supabase Setup (completo)
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New query → pega → Run
--
-- Incluye: tablas base, programa de puntos, y el módulo de
-- ROLES (seller / admin), estado de ENTREGA y RLS para el flujo
-- de Caja (QR) y el Panel de Ventas.
--
-- Es IDEMPOTENTE: se puede ejecutar varias veces sin romper nada.
-- Sirve tanto para una base nueva como para actualizar una existente.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1) TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name       TEXT        NOT NULL DEFAULT '',
  email           TEXT        NOT NULL DEFAULT '',
  loyalty_points  INTEGER     NOT NULL DEFAULT 0,
  role            TEXT        NOT NULL DEFAULT 'customer',
  seller_location TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  items            JSONB       NOT NULL,
  total_price      INTEGER     NOT NULL,
  delivery_type    TEXT        NOT NULL,
  store_location   TEXT,
  delivery_address TEXT,
  delivery_details TEXT,
  status           TEXT        NOT NULL DEFAULT 'pendiente',
  entregado        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.points_history (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_changed INTEGER     NOT NULL,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2) MIGRACIÓN DE COLUMNAS (para bases ya existentes)
--    Los CREATE TABLE de arriba ya traen estas columnas en una
--    base nueva; estos ALTER las añaden si la base es antigua.
-- ============================================================

-- profiles: rol del usuario + sede que atiende (sólo para 'seller')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role            TEXT NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS seller_location TEXT;

-- Valida que el rol sea uno de los permitidos
DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'seller', 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;  -- ya existe, no pasa nada
END $$;

-- orders: estado de entrega (boolean) para el flujo de caja.
-- Se mantiene 'status' (texto) por compatibilidad.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS entregado BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 3) ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_entregado      ON public.orders(entregado);
CREATE INDEX IF NOT EXISTS idx_orders_store_location ON public.orders(store_location);
CREATE INDEX IF NOT EXISTS idx_points_history_user   ON public.points_history(user_id);

-- ============================================================
-- 4) TRIGGER — crear perfil automáticamente al registrarse
--    Incluye el rol por defecto 'customer'.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, loyalty_points, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    0,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5) FUNCIÓN — sumar puntos de forma atómica
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_loyalty_points(p_user_id UUID, p_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE public.profiles
  SET loyalty_points = loyalty_points + p_points
  WHERE id = p_user_id
  RETURNING loyalty_points INTO v_new_total;

  RETURN v_new_total;
END;
$$;

-- ============================================================
-- 6) HELPERS de rol  (SECURITY DEFINER → evitan recursión de RLS)
--    Leen profiles sin disparar las políticas de la propia tabla.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_seller(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role IN ('seller', 'admin')  -- admin también puede operar caja
  );
$$;

-- ============================================================
-- 7) RPC — marcar pedido como entregado / revertir (Deshacer)
--    Es el camino que usa el frontend del seller.
--    Permite true (Pagar) y false (Deshacer) sólo a seller/admin.
--    SECURITY DEFINER: toca únicamente la columna 'entregado'.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_order_delivered(p_order_id UUID, p_value BOOLEAN)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.orders;
  v_loc TEXT;
BEGIN
  IF NOT public.is_seller(auth.uid()) THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol seller o admin';
  END IF;

  -- Sede del cajero que cobra (para atribuir ventas de pedidos por QR)
  SELECT seller_location INTO v_loc FROM public.profiles WHERE id = auth.uid();

  UPDATE public.orders
     SET entregado      = p_value,
         status         = CASE WHEN p_value THEN 'entregado' ELSE 'pendiente' END,
         -- Si es un pedido por QR sin sede, lo atribuye a la sede del cajero
         store_location = CASE
                            WHEN p_value AND store_location IS NULL THEN COALESCE(v_loc, store_location)
                            ELSE store_location
                          END
   WHERE id = p_order_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Pedido % no encontrado', p_order_id;
  END IF;

  RETURN v_row;
END;
$$;

-- ============================================================
-- 8) GUARD — un seller (no admin) sólo puede tocar 'entregado'
--    Si intenta cambiar items/total/dirección/etc., se bloquea.
--    Defensa en profundidad para UPDATE directos a la tabla.
-- ============================================================
CREATE OR REPLACE FUNCTION public.orders_seller_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- admin puede todo; dueño del pedido puede todo lo suyo
  IF public.is_admin(auth.uid()) OR auth.uid() = OLD.user_id THEN
    RETURN NEW;
  END IF;

  -- seller: sólo puede cambiar 'entregado'/'status' y atribuir la sede
  -- (store_location). Los campos sensibles (items, total, dirección) quedan
  -- bloqueados.
  IF public.is_seller(auth.uid()) THEN
    IF ROW(NEW.user_id, NEW.items, NEW.total_price, NEW.delivery_type,
           NEW.delivery_address, NEW.delivery_details, NEW.created_at)
       IS DISTINCT FROM
       ROW(OLD.user_id, OLD.items, OLD.total_price, OLD.delivery_type,
           OLD.delivery_address, OLD.delivery_details, OLD.created_at)
    THEN
      RAISE EXCEPTION 'El seller sólo puede actualizar el estado de entrega';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'No autorizado para modificar este pedido';
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_seller_guard ON public.orders;
CREATE TRIGGER trg_orders_seller_guard
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.orders_seller_guard();

-- ============================================================
-- 9) BACKFILL — migrar datos existentes
--    Pedidos ya finalizados pasan a entregado = true.
--    Se ejecuta después del guard, pero como SECURITY DEFINER del
--    script (postgres) no dispara las restricciones de seller.
-- ============================================================
UPDATE public.orders
SET entregado = TRUE
WHERE entregado = FALSE
  AND status IN ('entregado', 'pagado', 'completado', 'pagada', 'entregada');

-- ============================================================
-- 10) ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
-- El usuario ve y edita su propio perfil
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- El admin ve todos los perfiles (para dashboards / clientes)
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ---------- orders ----------
-- El cliente ve sus propios pedidos
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- El cliente crea pedidos a su nombre
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- El cliente puede editar SUS pedidos mientras no estén entregados
-- (necesario para "Editar pedido" desde el carrito)
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id AND entregado = FALSE);

-- El seller puede LEER cualquier pedido (para mostrarlo al escanear el QR)
DROP POLICY IF EXISTS "orders_select_seller" ON public.orders;
CREATE POLICY "orders_select_seller" ON public.orders
  FOR SELECT USING (public.is_seller(auth.uid()));

-- El seller puede ACTUALIZAR pedidos (el guard del bloque 8 limita a 'entregado')
DROP POLICY IF EXISTS "orders_update_seller" ON public.orders;
CREATE POLICY "orders_update_seller" ON public.orders
  FOR UPDATE USING (public.is_seller(auth.uid()))
  WITH CHECK (public.is_seller(auth.uid()));

-- El admin tiene lectura global de todos los pedidos (alimenta el dashboard)
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ---------- points_history ----------
DROP POLICY IF EXISTS "points_select_own" ON public.points_history;
CREATE POLICY "points_select_own" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_insert_own" ON public.points_history;
CREATE POLICY "points_insert_own" ON public.points_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_select_admin" ON public.points_history;
CREATE POLICY "points_select_admin" ON public.points_history
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================================
-- 11) PERMISOS de ejecución de las RPC para usuarios autenticados
-- ============================================================
GRANT EXECUTE ON FUNCTION public.add_loyalty_points(UUID, INTEGER)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_order_delivered(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_seller(UUID) TO authenticated;

-- ============================================================
-- 12) REALTIME — el dashboard de admin se actualiza en vivo
--     Añade 'orders' a la publicación de realtime de Supabase.
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN NULL;  -- ya estaba publicada
  WHEN undefined_object THEN NULL;  -- la publicación no existe en este entorno
END $$;

-- ============================================================
-- 13) (Opcional) VISTA de métricas agregadas por sede
--     'security_invoker = true' → la vista respeta la RLS de quien
--     la consulta (sólo admin verá todas las filas). NO expone datos.
-- ============================================================
CREATE OR REPLACE VIEW public.ventas_por_sede
WITH (security_invoker = true) AS
SELECT
  COALESCE(store_location, 'Domicilio / Sin sede') AS sede,
  COUNT(*)                                          AS num_pedidos,
  SUM(total_price)                                  AS total_ventas,
  COUNT(*) FILTER (WHERE entregado)                 AS entregados
FROM public.orders
GROUP BY 1;

-- ============================================================
-- 14) ASIGNAR ROLES — ejecútalo MANUALMENTE cambiando el email
--     (cada local = un seller; los dueños = admin)
-- ------------------------------------------------------------
-- Admin (dueño de la cadena):
--   UPDATE public.profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'dueno@soyorigen.co');
--
-- Seller de una sede (seller_location DEBE coincidir EXACTAMENTE con el
-- nombre usado en orders.store_location):
--   'CC Salitre Plaza' · 'Av. Chile — Local 408B' · 'CC Nuestro Bogotá'
--   UPDATE public.profiles
--   SET role = 'seller', seller_location = 'CC Salitre Plaza'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'salitre@soyorigen.co');
--
-- Tras asignar el rol, el staff debe RE-LOGUEARSE para que el perfil
-- recargue y aparezcan los enlaces de Caja / Escáner y Panel de Ventas.
-- ============================================================

-- ============================================================
-- Variables de entorno — Dashboard → Project Settings → API
--    VITE_SUPABASE_URL      = https://<project-id>.supabase.co
--    VITE_SUPABASE_ANON_KEY = <anon-public-key>
-- ============================================================
