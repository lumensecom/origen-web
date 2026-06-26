# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is the **single source of truth** for the project's current architecture.

> **Repository layout note:** the Git repository root is `origen-web/`, not the
> parent `Origen/` folder. This file is mirrored at both `Origen/CLAUDE.md`
> (loaded by Claude Code when launched from the parent dir) and
> `origen-web/CLAUDE.md` (tracked in the repo and shipped on push). Keep the two
> copies in sync when editing.

## Project Overview

**ORIGEN** is a React SPA for a healthy bowl restaurant in Bogotá (soyorigen.co). It handles online ordering, a custom bowl builder, an AI nutritional advisor ("Vita"), a loyalty points program, an in-store **QR pay/pickup** flow, a role-gated **Seller (Caja)** module, and a role-gated realtime **Admin** analytics dashboard. Deployed on Vercel with Supabase as the backend and Anthropic's Claude API for the AI advisor.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build to dist/ (staff modules code-split into lazy chunks)
npm run preview    # Preview production build locally
```

No lint or test scripts are configured.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
ANTHROPIC_API_KEY=sk-ant-...
```

`VITE_*` vars are exposed to the browser; `ANTHROPIC_API_KEY` is only used in the Vercel serverless function (`api/chat.js`). **Never commit `.env`** — only `.env.example` is tracked (see `.gitignore`).

**Additional Vercel-only env vars (server-side, never exposed to the browser):**
```
SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase → Project Settings → API>
RESEND_API_KEY=<Resend API key for transactional email>
```
`SUPABASE_SERVICE_ROLE_KEY` is required by `api/admin-users.js`. `RESEND_API_KEY` is required by `api/notify-order.js` (order confirmation emails). For local testing use `vercel dev`.

## Directory Structure

```
origen-web/src/
├── App.jsx                        # Lean shell: tab routing, global state, layout, edit/QR/seller orchestration
├── main.jsx                       # React root, wraps App in AuthProvider
├── constants/
│   ├── menu.js                    # CARTA (12 bowls), BEBIDAS, INGREDIENTE_COLORES
│   ├── locations.js               # LOCALES (3 Bogotá stores; nombre matches locales.name, localId ↔ locales.id)
│   ├── media.js                   # HERO_IMAGE, REAL_MEDIA (Cloudinary URLs)
│   ├── brand.js                   # BRAND_PHRASES, FEELINGS
│   └── colors.js                  # COLORS palette reference
├── utils/
│   └── format.js                  # formatPrice (COP locale)
├── features/                      # Feature-scoped hooks (state + side effects)
│   ├── cart/
│   │   └── useCart.js             # Cart state; addToCart/updateQty/removeItem/replaceItem,
│   │                              #   saveOrderForPickup (QR), confirmOrder (WhatsApp)
│   ├── notifications/
│   │   └── useOrderNotifications.js  # Global caja alerts: broadcast+CDC sub, chime, guarded vibrate, bell/toast state
│   └── admin/
│       └── useAnalytics.js        # Analytics data + filters; live-refresh on orders changes
├── pages/
│   ├── Inicio/index.jsx           # Home: hero, feelings widget, gallery, stats
│   ├── Carta/
│   │   ├── index.jsx              # Menu grid with filters and virales carousel
│   │   └── CartaCard.jsx          # Bowl/drink card with doble-proteína toggle
│   ├── Builder/
│   │   ├── index.jsx              # 7-step bowl builder; also handles "Editar pedido" preload + save-back
│   │   └── BowlSVG.jsx            # Animated SVG bowl preview
│   ├── Blog/index.jsx             # Blog posts + slide-in article reader
│   ├── Ubicaciones/index.jsx      # Store selector + Google Maps embed
│   ├── Cuenta/index.jsx           # Auth gate, user profile, Vita chatbot (decision tree)
│   ├── Historial/index.jsx        # Auth-gated CUSTOMER order history (list + expandable item breakdown)
│   ├── Seller/index.jsx           # ROLE-GATED, LAZY. Caja: Escáner (scan/manual search) + Historial (sede, filtered)
│   └── Admin/index.jsx            # ROLE-GATED, LAZY. Realtime KPIs + SVG charts + filters + order management
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx             # Fixed top nav (logo, hamburger, cart badge — or caja notification bell for staff)
│   │   ├── Footer.jsx             # Dark footer with links
│   │   └── SideDrawer.jsx         # Slide-in nav drawer; surfaces Caja/Panel links by role
│   ├── ui/
│   │   ├── Button.jsx             # Primary/ghost/outline variants
│   │   ├── LazyVideo.jsx          # InView + saveData-aware video loader
│   │   ├── FloatingLeaf.jsx       # Decorative animated leaf
│   │   ├── StatCounter.jsx        # Animated number counter (InView triggered)
│   │   ├── QRCode.jsx             # Renders a QR (qrcode lib) for an order UUID
│   │   └── animations.js          # fadeUp + staggerContainer Framer Motion variants
│   ├── admin/
│   │   ├── KpiCard.jsx            # Single KPI tile
│   │   ├── BarChart.jsx           # Hand-built on-brand SVG bar chart (no chart lib)
│   │   ├── Histogram.jsx          # Peak-hour SVG histogram (kept for reference, no longer rendered)
│   │   ├── SalesTrendPanel.jsx    # Paid-orders chart with Hora/Semana/Mes/Año toggle; counts entregado=true orders aggregated from created_at
│   │   ├── FilterBar.jsx          # Date / hour / location filter controls
│   │   └── OrderManager.jsx       # Search order by ID → edit dish quantities / delete order / "Visto por" audit trail (admin)
│   ├── seller/
│   │   ├── QRScanner.jsx          # Live camera scanner (html5-qrcode, iOS-safe) + manual fallback
│   │   ├── NotificationBell.jsx   # Navbar bell for the caja: unread badge + recent-orders dropdown
│   │   └── NotificationToasts.jsx # Global stacked new-order toasts (auto-dismiss 12 s)
│   ├── CheckoutModal.jsx          # Checkout: cart→deliveryType→store/address→confirm; QR + Editar/Eliminar
│   ├── OrderQRModal.jsx           # Shows QR encoding a persisted order's UUID for in-store payment
│   ├── AuthModal.jsx              # Login/register/forgot-password (Supabase Auth)
│   ├── VitaWidget.jsx             # Vita AI bowl advisor floating button (calls /api/chat)
│   └── NotificationBar.jsx        # Realtime in-app order-status toasts for customers (confirmado/listo/entregado)
├── contexts/
│   └── AuthContext.jsx            # Session + clientes/empleados; exposes role/isStaff/isSeller/isAdmin/isCajaSeller/sellerLocation
├── hooks/
│   └── useLockBodyScroll.js       # Prevents scroll when modals open (iOS-safe)
└── lib/
    ├── supabase.js                # Supabase client init (null when env vars absent)
    └── database.js                # Data access layer (see below)
```

## Architecture

### State Management

- **AuthContext** (`useAuth()`): Supabase session + identity. Loads the customer's `clientes` row **and** any `empleados` row in parallel, then derives `role` (`customer`/`seller`/`admin`), `isStaff`, `isSeller` (seller **or** admin), `isAdmin`, `isCajaSeller` (a pure seller), `sellerLocalId`, and `sellerLocation` (resolved from `LOCALES` by sede id). Staff (`empleados`) always win over the customer fallback — an account is one or the other.
- **useCart** (`features/cart/useCart.js`): Cart state + all order logic — Supabase persistence, QR generation (whole-cart only via `payAll`), and order confirmation. Pickup orders are persisted **in `confirmOrder`** (not `payAll`) so the DB trigger notifies the caja immediately; `payAll` reuses the cached row via `masterOrderId`/`masterSig`.
- **useAnalytics** (`features/admin/useAnalytics.js`): Admin dashboard data + filter state, with live refresh.
- **useOrderNotifications** (`features/notifications/useOrderNotifications.js`): App-wide caja new-order alerts — subscribes to the sede broadcast + a `postgres_changes` safety net (deduped), plays a chime, fires a guarded `navigator.vibrate()`, and owns the bell/toast state. Mounted in `App.jsx`.
- **Local `useState` in App.jsx**: Active tab, scroll position, modal flags, and edit/seller-resume orchestration (`editingOrder`, `sellerResumeOrder`) — UI-only.

### Routing

Tab-based (no React Router). `activeTab` string in App.jsx controls which page renders inside `<AnimatePresence>`. Navigation is `navigate(tabId)`, which also scrolls to top. The `seller` and `admin` tabs are **lazy-loaded** (`React.lazy` + `<Suspense>`) so their code (including the ~430 kB scanner chunk) ships in separate chunks and only loads when staff open them. **On login a seller (`isCajaSeller`) is redirected to the `seller` tab**, and all purchasing UI (the Navbar cart and `handleAddToCart`) is disabled for staff (`isSeller`).

### Edit Order Flow ("Editar pedido")

Editing a **builder bowl** routes into `pages/Builder` preloaded with the bowl's selections, then **saves back to the same order/cart line** instead of creating a new one. App.jsx tracks this via `editingOrder` (with `source`, `orderId`, `bowl`, `returnTab`/seller-resume context). Premade bowls and drinks are not editable in the builder (nothing to edit), so the edit affordance is builder-bowl-only. Customer edits return to checkout; seller edits return to the Caja checkout view (`sellerResumeOrder`).

### Cart Persistence (strict)

`useCart` persists both the cart lines and the checkout state to **localStorage** (`origen.cart.v1`, `origen.checkout.v1`), so the cart survives reloads and the WhatsApp hand-off. Orders are **never** auto-cleared just because a link was opened. A cart line only leaves the active cart when:
- **(A)** the customer deletes it (per-item trash / "Vaciar carrito"), or
- **(B)** a seller scans its QR and marks the linked order `entregado = true`.

Condition (B) is synced live: `useCart` subscribes to Supabase realtime on the user's `orders` and prunes the matching line(s) when `entregado` flips (and reconciles already-delivered orders on load via `getOrderHistory`). Each line carries an optional `paidOrderId`; the master order id lives on `checkout.masterOrderId`. Paying the master order empties the cart; paying an individual item order removes just that line.

### In-Store QR Pay/Pickup Flow

QR generation is **gated** behind the pickup sequence. The customer must: pick **Recoger en local** → choose a specific store → click **Confirmar**. That confirmation (`useCart.confirmOrder`) **immediately persists the order** in Supabase (`channel='pickup'`, `status='recibido'`) so the `broadcast_new_order` DB trigger fires and the caja is notified at once — staff can start preparing before the customer arrives. `confirmOrder` also sets `checkout.unlocked = true` and caches `masterOrderId`/`masterSig`. The cart then stays visible as a pay-in-store zone with one QR path:

- **Pagar todo** (master QR) — `useCart.payAll()` reuses the already-persisted order if the cart hasn't changed (via the `masterSig` signature check); only creates a new row if the cart was edited after confirmation. Shows the QR via `OrderQRModal`.

> **`payItem` (per-item QR) was removed.** The QR is always for the whole cart. This keeps the caja flow simple: one QR → one order → one Pagar.

A quantity/edit change invalidates the cached QR (`paidSig` on the line). Requires the customer to be **logged in** (RLS owns-row insert); guests are routed to login. In the Caja, a seller scans the QR → fetches the order (via `seller_get_order`) → reviews the breakdown → **Pagar** (flips `entregado = true` via RPC) or **Editar pedido**. Paying clears the customer's cart in realtime. The Pagar success screen offers **Deshacer** (revert) and **Escanear nuevo QR**.

### User Order History — `pages/Historial`

Auth-gated tab (`historial`) linked from the SideDrawer for logged-in **customers only** (hidden for staff). Fetches the user's orders via `getOrderHistory` and lists each with its short code (`#XXXXXXXX`), date, store, delivery status (`entregado`), total, and an expandable item breakdown (builder bowls show base/proteína/frescuras/sabores/salsa). Live-refreshes on the user's `orders` changes.

### Multi-Channel Orders (pickup vs online)

Orders are differentiated on a **single `orders` table** by a `channel` discriminator (single-table design keeps RLS, realtime, the seller guard, analytics, and all RPCs on one table):
- **`pickup`** — physical sede order (Recoger en local / in-store QR). **Requires a valid `local_id`** (FK → `locales`), enforced by the `orders_pickup_requires_local` CHECK and in the UI (a sede must be chosen). Functionally required too: the seller's RLS only exposes orders for their own `local_id`, so a pickup order without one is invisible in the Caja.
- **`delivery`** — online/remote order (domicilio today; Rappi/Didi/web later). Captures `customer_name`/`customer_phone`, `delivery_address`/`delivery_zone`, and `source`; enforced by `orders_delivery_requires_contact` (address + phone).

**Third-party extensibility:** `source` identifies the origin, `external_ref` holds the provider's order id, and `channel_meta` (JSONB) absorbs provider-specific payloads with no schema migration. `CheckoutModal` collects the channel-specific data; `useCart` writes the typed columns (`confirmOrder` → both pickup and delivery; `payAll` → reuses/recreates the pickup row for QR display).

### Order Flow → WhatsApp

For delivery orders, Checkout (`CheckoutModal`) collects address, a **required contact phone**, and optional zone/notes. `useCart.confirmOrder()` validates the channel selection, persists the order as `channel='delivery'` (if authenticated), formats a WhatsApp message (with contact + zone), and opens `wa.me/573103112799`. No payment gateway. Pickup orders are also persisted in `confirmOrder` (see QR flow above) — not deferred to QR generation.

### Seller (Caja) Module — `pages/Seller`

Role-gated (`isSeller`) and lazy-loaded. A segmented control switches between two modes:

- **Escáner** — the live camera scanner (`components/seller/QRScanner.jsx`, html5-qrcode, iOS-compatible) with a manual-code fallback. Scan or type a code → `seller_get_order` RPC → full breakdown → **Listo** (marks `status = 'listo'`) / **Pagar** (flips `entregado = true` via RPC) / **Editar pedido**. On first open (`status = recibido`), the order is auto-advanced to `confirmado` **and** a confirmation email is sent to the customer via `POST /api/notify-order` (fire-and-forget). Pagar calls `setOrderDelivered`. Edits route through the builder and return here. Seller's view of the order also calls `recordOrderView` for the admin audit trail.
- **Historial** — the sede's order history (`sellerListOrders` → `seller_list_orders` RPC), showing only orders this caja has **scanned/entered** (`scanned_at` set), with two filter rows:
  - **Estado:** Todos (default) · Solo escaneados (`scanned`, pending) · Escaneados y pagados (`paid`).
  - **Periodo:** Hoy (default) · Última hora · Últimas 3 h · Últimas 12 h.

**Realtime new-order alerts (global, app-wide):** when a customer creates a pickup order for a sede, the DB trigger `broadcast_new_order` (`trg_orders_broadcast_new`, `AFTER INSERT`) dispatches a Supabase Realtime **broadcast** to the private topic `sede:<local_id>`; the `realtime.messages` RLS policy `caja_recibe_pedidos_de_su_sede` routes it only to that sede's caja (admins see all). The `useOrderNotifications` hook — mounted in `App.jsx`, enabled for a sede-bound seller (`isSeller && sellerLocalId`) — subscribes to that broadcast **and** keeps a `postgres_changes` INSERT subscription as a safety net, **deduplicated by order id**. On a new order it plays a two-tone Web Audio chime, fires `navigator.vibrate()` (guarded — silently skipped on iOS Safari, no crash), and feeds two surfaces: the Navbar **bell** (`NotificationBell` — unread badge + recent-orders dropdown) and stacked floating **toasts** (`NotificationToasts` — auto-dismiss after 12 s). Clicking either opens that order in the Caja scanner. This works on **any tab**, not just the Seller module (which no longer owns the subscription).

**Order-search input sanitation (the 400 fix):** the short order code is shown as `#XXXXXXXX`, but the `#` is display-only. Sending it into a REST filter produced `GET …/orders?id=eq.%230B591428` → **400 Bad Request** (and short codes aren't valid UUIDs). All search now strips `#` (and whitespace) client-side in `database.js` (`cleanOrderNumber`) **and** the RPCs sanitise `#`/`-`/spaces server-side. Sellers never query `orders.id` directly — they go through `seller_get_order`, which matches a full UUID **or** a short prefix, scopes the result to the seller's own sede (location), and records the scan. Admin search goes through `admin_get_order` (also `#`-sanitised). So order lookup is, effectively, **location + order number** only.

### Admin Dashboard — `pages/Admin`

Role-gated (`isAdmin`), lazy-loaded, and **realtime** (re-refreshes on any `orders` change via Supabase realtime). KPIs plus hand-built on-brand **SVG charts** (zero chart-lib): sales by location, paid-orders trend panel, best/least dishes, best/least ingredients (from builder orders). Interactive date / hour / location filters via `components/admin/FilterBar.jsx` and `useAnalytics`.

**Sales trend panel (`SalesTrendPanel`):** replaced the fixed peak-hour histogram. Counts only **paid orders** (`entregado = true`) and lets the admin toggle granularity:
- **Hora** — 24 bars, one per hour of the day.
- **Semana** — 7 bars Mon–Sun scoped to the current calendar week (auto-resets).
- **Mes** — 12 bars Jan–Dec for a selectable year (dropdown shows years with data + current year).
- **Año** — one bar per year with data.

Aggregates on the client from `created_at` timestamps in the `orders` array returned by `useAnalytics`, so it stays live-reactive with no separate counters or localStorage state.

**Order management** (`components/admin/OrderManager.jsx`): a search bar resolves an order by ID (short `#XXXXXXXX` code or full UUID) through the `admin_get_order` RPC, then lets the admin edit each dish's quantity (the multiplier), remove a line, **save** (`updateOrder` → items + recomputed `total_price`), or **delete the whole order** (`deleteOrder`, gated by the `orders_delete_admin` RLS policy). Each order card also shows a **"Visto por"** panel listing which sellers opened the order (from `order_views`) with timestamps.

### Roles & Staff Access

Identity is **split across two tables** (refactored away from a single `profiles.role`):

- **`clientes`** (customers) — renamed from `profiles`; `role` CHECK-locked to `customer`. The old staff columns (`seller_location`, `local_id`) were dropped. New signups are seeded here by `handle_new_user()`.
- **`empleados`** (staff) — `id` (PK → `auth.users`), `id_local` (FK → `locales`; **`NULL` = global admin**, since `0` can't satisfy the FK), `rol` (`seller`/`admin`), `fecha_creacion`. **Source of truth for every role check.**

`is_admin`/`is_seller`, `set_order_delivered`, the seller RLS, and the `seller_*` RPCs all read `empleados`. A seller is bound to **one sede** via `empleados.id_local`; an admin has `id_local = NULL` and global access. The SideDrawer surfaces **Caja / Escáner** and **Panel de Ventas** links by role. **After adding a staff account to `empleados`, that account must re-login** so AuthContext reloads the role and the links/redirect take effect.

Sede ↔ `local_id` ↔ Caja account (must stay consistent with `constants/locations.js` `localId` and `locales.name`):

| Sede | `locales.name` | `id_local` |
|---|---|---|
| Salitre Plaza | `CC salitre Plaza` | `1` |
| Avenida Chile | `CC av chile` | `2` |
| Nuestro Bogotá | `CC Nuestro Bogota` | `3` |

The admin account (`rol='admin'`, `id_local=NULL`) sees every sede. All staff login credentials (emails + passwords) live in the untracked `context_base.md`, **never** in the repo.

> After any schema migration, reload the PostgREST API cache so new columns are exposed to the REST API: `NOTIFY pgrst, 'reload schema';`

### Data Access Layer — `lib/database.js`

`getProfile` (reads `clientes`, `maybeSingle`), `getEmpleado` (reads `empleados`, `maybeSingle`), `addLoyaltyPoints`, `addPointsHistory`, `createOrder`, `getOrderHistory`, `getOrderById`, `updateOrder`, `setOrderDelivered` (`set_order_delivered` RPC; also best-effort updates `status = 'entregado'` for customer `NotificationBar`), `adminSearchOrders` (`admin_get_order` RPC, `#`-sanitised), `sellerSearchOrder` (`seller_get_order` RPC, `#`-sanitised, sede-scoped, records the scan), `sellerListOrders` (`seller_list_orders` RPC, status + `since` filters), `deleteOrder` (admin-only), `recordOrderView(orderId, sellerId)` (inserts into `order_views`; called by the Caja when a seller opens an order), `getOrderViews(orderId)` (fetches all view records enriched with seller names; used by the admin `OrderManager`), and `getOrdersForAnalytics({ from, to, location })`. The shared `cleanOrderNumber` helper strips `#`/whitespace before any search hits the API.

### Menu Data

All bowl and drink data is **hardcoded** in `constants/menu.js` as `CARTA` and `BEBIDAS`. Bowl IDs (`tierra`, `fuego`, `agua`, `raiz`, `aire`, `brasa`, `dulce`, `cosecha`, `paraiso`, `natural`, `vital`, `maximo`) are referenced in the Vita AI system prompt in `api/chat.js` — keep both in sync if the menu changes.

### Vita AI

Two implementations exist:
1. **VitaWidget** (`components/VitaWidget.jsx`) — full AI chat via `/api/chat` (Claude Haiku), floating button with Vita mascot.
2. **CuentaView chatbot** — local decision-tree (no API call), embedded in the account page.

`/api/chat.js` is a Vercel serverless function; its system prompt contains the full menu. Bowl recommendations use the `[BOWL:id]` tag that the widget parses to render a bowl card.

### Styling

- Tailwind CSS for layout and utilities.
- CSS variables (`--verde-main`, `--fondo-crema`, etc.) defined in the `<style>` block in App.jsx — used everywhere via `var()`.
- Framer Motion for all animations (scroll reveals via `useInView`, modal transitions via `AnimatePresence`).
- Images from Cloudinary with `q_auto,f_auto,w_800` transforms. Videos only play when in-view and `navigator.connection.saveData` is false.

### Key Dependencies

`react`/`react-dom` 18, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `framer-motion`, `lucide-react`, `html5-qrcode` (camera QR scanning), `qrcode` (QR image generation), `resend` (transactional email in `api/notify-order.js`), Tailwind/PostCSS/Autoprefixer, Vite.

### Database (Supabase PostgreSQL)

The baseline lives in `supabase-setup.sql`; the live DB has since applied the **staff/customer split** via three tracked Supabase migrations — `staff_empleados_refactor`, `clientes_customer_only_role`, `harden_seller_rpc_grants` — which are **not** reflected in `supabase-setup.sql` (treat the migrations as authoritative for identity/roles). Core tables:

- **clientes** (formerly `profiles`) — customer profiles only: `loyalty_points` and `role` (CHECK-locked to `customer`). `id` → `auth.users(id)` ON DELETE CASCADE.
- **empleados** — staff identity: `id` (PK → `auth.users`), `id_local` (FK → `locales`; **NULL = global admin**), `rol` (`seller`/`admin`, CHECK), `fecha_creacion`. RLS: a staff member reads their own row; admins manage all.
- **orders** — `items` JSON, `total_price`, `status` (lifecycle CHECK: `recibido`/`confirmado`/`en_preparacion`/`listo`/`entregado`/`cancelado`), `entregado` (boolean delivery flag). **Multichannel columns:** `channel` (`pickup`|`delivery`, NOT NULL), `local_id` (FK → `locales`; required for pickup), `source`, `customer_name`, `customer_phone`, `delivery_zone`, `external_ref`, `channel_meta` (JSONB). **Caja-activity:** `scanned_at` / `scanned_por` (FK → `empleados`; set when a seller scans/searches the order). Plus legacy/display `delivery_type`/`store_location`/`delivery_address`/`delivery_details` and audit `square_order_id`/`confirmado_por` (FK → `empleados`)/`confirmado_at`/`updated_at`. (`confirmado_por`/`scanned_por` reference **`empleados`** — staff, not customers.)
- **locales** — physical stores (`id` smallint, `name`, `direccion`), seeded with the 3 sedes: `1 = CC salitre Plaza`, `2 = CC av chile`, `3 = CC Nuestro Bogota` (ids ↔ `constants/locations.js` `localId`). Public SELECT RLS.
- **order_views** — audit trail: `order_id` (FK → `orders`), `seller_id` (FK → `empleados`), `viewed_at`. Inserted by `recordOrderView` each time a seller opens an order in the Caja. Read by `getOrderViews` for the admin OrderManager's "Visto por" panel.
- **points_history**.

Functions/RPCs: `handle_new_user()` (seeds a `clientes` row with `role='customer'`), `add_loyalty_points(user_id, points)` (atomic; updates `clientes`; **gated to seller/admin** — see "Known issue"), `is_admin(uid)` / `is_seller(uid)` (read `empleados`; admin also passes `is_seller`), `set_order_delivered(order_id, value)` (SECURITY DEFINER; sets `entregado`/`status` + `confirmado_por`/`confirmado_at`, reads the seller's `id_local` from `empleados`, **scoped to the seller's own sede**), `admin_get_order(query)` (SECURITY DEFINER, admin-gated), `seller_get_order(query)` (SECURITY DEFINER, seller-gated; sanitises `#`/`-`/spaces, matches full UUID or short prefix, **scoped to the seller's sede**, and records `scanned_at`/`scanned_por`), and `seller_list_orders(status, since)` (SECURITY DEFINER, seller-gated; sede-scoped history of scanned orders). The `orders_seller_guard` trigger (`trg_orders_seller_guard`) restricts a non-admin seller to delivery-state/attribution columns only (it does **not** protect `entregado`/`status`/`confirmado_*`/`scanned_*`, so Pagar and scan-marking pass); **admins bypass the guard**. The `broadcast_new_order()` trigger (`trg_orders_broadcast_new`, `AFTER INSERT`) dispatches a Realtime **broadcast** of each new pickup order to the private topic `sede:<local_id>` via `realtime.send` (SECURITY DEFINER; EXECUTE revoked from `anon`/`authenticated`); the `realtime.messages` RLS policy `caja_recibe_pedidos_de_su_sede` scopes receipt to that sede's caja (admins see all). Applied as migrations `realtime_new_order_alerts` + `revoke_broadcast_new_order_execute`.

**RLS:** each user reads/writes their own rows; customers may update their own orders only while `entregado = false`; **sellers may SELECT/UPDATE only orders for their own sede** (`orders.local_id` = their `empleados.id_local`; admins pass globally via `is_admin`; the guard further limits non-admin sellers to delivery state); admins get global SELECT on orders, UPDATE on orders, and **DELETE on orders** (`orders_delete_admin`). `empleados` has own-row SELECT + admin-manage policies. `orders` is in the realtime publication for the live dashboard, cart/history sync, and the caja new-order CDC safety net (the primary new-order alert is the broadcast above). The `seller_*` RPCs are granted to `authenticated` only (EXECUTE revoked from `anon`/`public`).

> **Known issue (loyalty):** `confirmOrder` still calls `add_loyalty_points` as the *customer*, but the RPC is restricted to seller/admin, so the 50-pt award **silently no-ops** for customers (the error is caught). Fix forward by awarding points server-side on payment (e.g., inside `set_order_delivered`) rather than from the client.

**Migration strategy:** `supabase-setup.sql` is the idempotent baseline; identity/role changes after it are applied as named Supabase migrations via MCP (see the three named above). Apply baseline by pasting into Supabase → SQL Editor → Run; apply incremental schema work as migrations and reload the PostgREST cache (`NOTIFY pgrst, 'reload schema';`).

### API Serverless Functions

| File | Method | Purpose |
|---|---|---|
| `api/chat.js` | POST | Vita AI (Anthropic Claude Haiku) |
| `api/admin-users.js` | POST | Create new auth user + seed empleados if staff |
| `api/admin-users.js` | DELETE | Delete auth user (cascades to clientes/empleados) |
| `api/notify-order.js` | POST | Send order confirmation email via Resend to the customer |

`api/admin-users.js` requires `SUPABASE_SERVICE_ROLE_KEY`. `api/notify-order.js` requires both `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`; it fetches the order + customer email and sends a branded HTML email from `noreply@soyorigen.co`.

### Deployment

`api/` directory follows Vercel serverless conventions. `dist/` is the static Vite output. Staff modules are code-split, so the scanner chunk loads only when a seller opens the Caja.
