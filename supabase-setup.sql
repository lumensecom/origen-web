-- ============================================================
-- ORIGEN — Supabase Setup
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New query → pega → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  loyalty_points INTEGER    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_user ON public.points_history(user_id);

-- ============================================================
-- TRIGGER — crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, loyalty_points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    0
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
-- FUNCIÓN — sumar puntos de forma atómica
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_loyalty_points(p_user_id UUID, p_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_select_own" ON public.points_history;
CREATE POLICY "points_select_own" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_insert_own" ON public.points_history;
CREATE POLICY "points_insert_own" ON public.points_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Copia las variables de entorno desde:
--    Dashboard → Project Settings → API
--    VITE_SUPABASE_URL  = https://<project-id>.supabase.co
--    VITE_SUPABASE_ANON_KEY = <anon-public-key>
-- ============================================================
