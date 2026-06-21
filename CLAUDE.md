# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is the **single source of truth** for the project's current architecture.

> **Repository layout note:** the Git repository root is `origen-web/`, not the
> parent `Origen/` folder. This file is mirrored at both `Origen/CLAUDE.md`
> (loaded by Claude Code when launched from the parent dir) and
> `origen-web/CLAUDE.md` (tracked in the repo and shipped on push). Keep the two
> copies in sync when editing.

## Project Overview

**ORIGEN** is a React SPA for a healthy bowl restaurant in Bogotá (soyorigen.co). It handles online ordering, a custom bowl builder, an AI nutritional advisor ("Savia"), a loyalty points program, an in-store **QR pay/pickup** flow, a role-gated **Seller (Caja)** module, and a role-gated realtime **Admin** analytics dashboard. Deployed on Vercel with Supabase as the backend and Anthropic's Claude API for the AI advisor.

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

## Directory Structure

```
origen-web/src/
├── App.jsx                        # Lean shell: tab routing, global state, layout, edit/QR/seller orchestration
├── main.jsx                       # React root, wraps App in AuthProvider
├── constants/
│   ├── menu.js                    # CARTA (12 bowls), BEBIDAS, INGREDIENTE_COLORES
│   ├── locations.js               # LOCALES (3 Bogotá stores)
│   ├── media.js                   # HERO_IMAGE, REAL_MEDIA (Cloudinary URLs)
│   ├── brand.js                   # BRAND_PHRASES, FEELINGS
│   └── colors.js                  # COLORS palette reference
├── utils/
│   └── format.js                  # formatPrice (COP locale)
├── features/                      # Feature-scoped hooks (state + side effects)
│   ├── cart/
│   │   └── useCart.js             # Cart state; addToCart/updateQty/removeItem/replaceItem,
│   │                              #   saveOrderForPickup (QR), confirmOrder (WhatsApp)
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
│   ├── Cuenta/index.jsx           # Auth gate, user profile, Savia chatbot (decision tree)
│   ├── Historial/index.jsx        # Auth-gated user order history (list + expandable item breakdown)
│   ├── Seller/index.jsx           # ROLE-GATED, LAZY. Caja: scan QR → order breakdown → Pagar/Editar
│   └── Admin/index.jsx            # ROLE-GATED, LAZY. Realtime KPIs + SVG charts + filters + order management
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx             # Fixed top nav (logo centered, hamburger, cart badge)
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
│   │   ├── Histogram.jsx          # Peak-hour SVG histogram
│   │   ├── FilterBar.jsx          # Date / hour / location filter controls
│   │   └── OrderManager.jsx       # Search order by ID → edit dish quantities / delete order (admin)
│   ├── seller/
│   │   └── QRScanner.jsx          # Live camera scanner (html5-qrcode, iOS-safe) + manual fallback
│   ├── CheckoutModal.jsx          # Checkout: cart→deliveryType→store/address→confirm; QR + Editar/Eliminar
│   ├── OrderQRModal.jsx           # Shows QR encoding a persisted order's UUID for in-store payment
│   ├── AuthModal.jsx              # Login/register/forgot-password (Supabase Auth)
│   └── SaviaWidget.jsx            # AI bowl advisor (calls /api/chat)
├── contexts/
│   └── AuthContext.jsx            # Supabase session, profile, loyalty points; exposes role/isSeller/isAdmin/sellerLocation
├── hooks/
│   └── useLockBodyScroll.js       # Prevents scroll when modals open (iOS-safe)
└── lib/
    ├── supabase.js                # Supabase client init (null when env vars absent)
    └── database.js                # Data access layer (see below)
```

## Architecture

### State Management

- **AuthContext** (`useAuth()`): Supabase session, user profile, loyalty points, **role**. Derives `role` (`customer`/`seller`/`admin`), `isSeller`, `isAdmin`, and `sellerLocation` from the profile row — global.
- **useCart** (`features/cart/useCart.js`): Cart state + all order logic — Supabase persistence, QR generation, and WhatsApp message generation.
- **useAnalytics** (`features/admin/useAnalytics.js`): Admin dashboard data + filter state, with live refresh.
- **Local `useState` in App.jsx**: Active tab, scroll position, modal flags, and edit/seller-resume orchestration (`editingOrder`, `sellerResumeOrder`) — UI-only.

### Routing

Tab-based (no React Router). `activeTab` string in App.jsx controls which page renders inside `<AnimatePresence>`. Navigation is `navigate(tabId)`, which also scrolls to top. The `seller` and `admin` tabs are **lazy-loaded** (`React.lazy` + `<Suspense>`) so their code (including the ~430 kB scanner chunk) ships in separate chunks and only loads when staff open them.

### Edit Order Flow ("Editar pedido")

Editing a **builder bowl** routes into `pages/Builder` preloaded with the bowl's selections, then **saves back to the same order/cart line** instead of creating a new one. App.jsx tracks this via `editingOrder` (with `source`, `orderId`, `bowl`, `returnTab`/seller-resume context). Premade bowls and drinks are not editable in the builder (nothing to edit), so the edit affordance is builder-bowl-only. Customer edits return to checkout; seller edits return to the Caja checkout view (`sellerResumeOrder`).

### Cart Persistence (strict)

`useCart` persists both the cart lines and the checkout state to **localStorage** (`origen.cart.v1`, `origen.checkout.v1`), so the cart survives reloads and the WhatsApp hand-off. Orders are **never** auto-cleared just because a link was opened. A cart line only leaves the active cart when:
- **(A)** the customer deletes it (per-item trash / "Vaciar carrito"), or
- **(B)** a seller scans its QR and marks the linked order `entregado = true`.

Condition (B) is synced live: `useCart` subscribes to Supabase realtime on the user's `orders` and prunes the matching line(s) when `entregado` flips (and reconciles already-delivered orders on load via `getOrderHistory`). Each line carries an optional `paidOrderId`; the master order id lives on `checkout.masterOrderId`. Paying the master order empties the cart; paying an individual item order removes just that line.

### In-Store QR Pay/Pickup Flow

QR generation is **gated** behind the pickup sequence and is **not** offered in the initial "Tu Pedido" view. The customer must: pick **Recoger en local** → choose a specific store → click **Confirmar por WhatsApp**. That confirmation (`useCart.confirmOrder`) sends the WhatsApp message, awards points, and sets `checkout.unlocked = true` (persisted) — it does **not** persist an order or clear the cart. The cart then stays visible as a pay-in-store zone exposing two QR paths:
- **Pagar todo** (master QR) — `useCart.payAll()` persists the whole cart as one `orders` row and shows its QR.
- **Per-item QR** — `useCart.payItem(line)` persists a single line as its own `orders` row and shows that item's QR.

Both reuse an existing pending order while the cart/line is unchanged (signature check) to avoid duplicate rows; a quantity/edit change invalidates the cached QR. `OrderQRModal` renders the QR encoding the order UUID. Requires the customer to be **logged in** (RLS owns-row insert); guests are routed to login. In the Caja, a seller scans the QR → fetches the order → reviews the breakdown → **Pagar** (flips `entregado = true` via RPC) or **Editar pedido**. Paying removes the corresponding line(s) from the customer's cart in realtime. The Pagar success screen offers **Deshacer** (revert) and **Escanear nuevo QR**.

### User Order History — `pages/Historial`

Auth-gated tab (`historial`) linked from the SideDrawer for logged-in customers. Fetches the user's orders via `getOrderHistory` and lists each with its short code (`#XXXXXXXX`), date, store, delivery status (`entregado`), total, and an expandable item breakdown (builder bowls show base/proteína/frescuras/sabores/salsa). Live-refreshes on the user's `orders` changes.

### Order Flow → WhatsApp

For non-QR orders, Checkout (`CheckoutModal`) collects delivery type and destination. `useCart.confirmOrder()` saves the order to Supabase (if authenticated, awards 50 loyalty points), formats a WhatsApp message, and opens `wa.me/573103112799`. No payment gateway.

### Seller (Caja) Module — `pages/Seller`

Role-gated (`isSeller`) and lazy-loaded. Default view is the live camera scanner (`components/seller/QRScanner.jsx`, html5-qrcode, iOS-compatible) with a manual-code fallback. Scan → fetch order → full breakdown → **Pagar** / **Editar pedido**. Pagar calls `setOrderDelivered` (the `set_order_delivered` RPC). Edits route through the builder and return to the Caja checkout.

### Admin Dashboard — `pages/Admin`

Role-gated (`isAdmin`), lazy-loaded, and **realtime** (re-refreshes on any `orders` change via Supabase realtime). KPIs plus hand-built on-brand **SVG charts** (zero chart-lib): sales by location, peak-hour histogram, best/least dishes, best/least ingredients (from builder orders). Interactive date / hour / location filters via `components/admin/FilterBar.jsx` and `useAnalytics`.

**Order management** (`components/admin/OrderManager.jsx`): a search bar resolves an order by ID (short `#XXXXXXXX` code or full UUID) through the `admin_get_order` RPC, then lets the admin edit each dish's quantity (the multiplier), remove a line, **save** (`updateOrder` → items + recomputed `total_price`), or **delete the whole order** (`deleteOrder`, gated by the `orders_delete_admin` RLS policy).

### Roles & Staff Access

Roles live on `profiles.role` (`customer` | `seller` | `admin`); sellers also have `seller_location`. The SideDrawer surfaces **Caja / Escáner** and **Panel de Ventas** links based on role. **After assigning a role in Supabase, the staff account must re-login** so the profile reloads and the links appear. `seller_location` must match a store name exactly: `CC Salitre Plaza`, `Av. Chile — Local 408B`, or `CC Nuestro Bogotá`. Admins use `role = 'admin'`.

### Data Access Layer — `lib/database.js`

`getProfile`, `addLoyaltyPoints`, `addPointsHistory`, `createOrder`, `getOrderHistory`, `getOrderById`, `updateOrder`, `setOrderDelivered` (calls the `set_order_delivered` RPC), `adminSearchOrders` (calls the `admin_get_order` RPC), `deleteOrder` (admin-only), and `getOrdersForAnalytics({ from, to, location })`.

### Menu Data

All bowl and drink data is **hardcoded** in `constants/menu.js` as `CARTA` and `BEBIDAS`. Bowl IDs (`tierra`, `fuego`, `agua`, `raiz`, `aire`, `brasa`, `dulce`, `cosecha`, `paraiso`, `natural`, `vital`, `maximo`) are referenced in the Savia AI system prompt in `api/chat.js` — keep both in sync if the menu changes.

### Savia AI

Two implementations exist:
1. **SaviaWidget** — full AI chat via `/api/chat` (Claude Haiku), floating button.
2. **CuentaView chatbot** — local decision-tree (no API call), embedded in the account page.

`/api/chat.js` is a Vercel serverless function; its system prompt contains the full menu. Bowl recommendations use the `[BOWL:id]` tag that the widget parses to render a bowl card.

### Styling

- Tailwind CSS for layout and utilities.
- CSS variables (`--verde-main`, `--fondo-crema`, etc.) defined in the `<style>` block in App.jsx — used everywhere via `var()`.
- Framer Motion for all animations (scroll reveals via `useInView`, modal transitions via `AnimatePresence`).
- Images from Cloudinary with `q_auto,f_auto,w_800` transforms. Videos only play when in-view and `navigator.connection.saveData` is false.

### Key Dependencies

`react`/`react-dom` 18, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `framer-motion`, `lucide-react`, `html5-qrcode` (camera QR scanning), `qrcode` (QR image generation), Tailwind/PostCSS/Autoprefixer, Vite.

### Database (Supabase PostgreSQL)

Schema in `supabase-setup.sql` (the canonical, idempotent setup script). Three tables:

- **profiles** — `loyalty_points`, plus `role` (`customer`/`seller`/`admin`, CHECK-constrained) and `seller_location`.
- **orders** — `items` JSON, `status`, and `entregado` (boolean delivery flag, default false; backfilled to true for already-finalized orders).
- **points_history**.

Functions/RPCs: `handle_new_user()` (seeds `role='customer'`), `add_loyalty_points(user_id, points)` (atomic), `is_admin(uid)`, `is_seller(uid)` (admin also passes), `set_order_delivered(order_id, value)` (SECURITY DEFINER; only touches `entregado`/`status`), and `admin_get_order(query)` (SECURITY DEFINER, admin-gated; matches an order by full UUID or short id prefix for the admin search). An `orders_seller_guard` trigger restricts a non-admin seller to changing only `entregado`/`status` and attributing their sede; **admins bypass the guard** and may edit any field.

**RLS:** each user reads/writes their own rows; customers may update their own orders only while `entregado = false`; sellers may SELECT all orders and UPDATE (guard-limited) delivery status; admins get global SELECT on orders/profiles/points, UPDATE on orders (via the seller policy + guard bypass, used to edit quantities), and **DELETE on orders** (`orders_delete_admin` policy). `orders` is added to the realtime publication for the live dashboard and live cart/history sync.

**Migration strategy:** `supabase-setup.sql` is written to be **idempotent and dual-purpose** — safe on both a fresh install and an existing DB (`CREATE ... IF NOT EXISTS`, `CREATE OR REPLACE`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `DO $$ ... EXCEPTION` guards). New columns are declared in both `CREATE TABLE` (fresh install) and an `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` block (existing DB no-op). Apply by pasting into Supabase → SQL Editor → Run, then assign roles using the snippets at the bottom of the file.

> Note: `base_correcta.txt` (in the parent `Origen/` folder, outside the repo) was an earlier draft of these DB changes; its contents have been merged into `supabase-setup.sql`, which is now authoritative.

### Deployment

`api/` directory follows Vercel serverless conventions. `dist/` is the static Vite output. Staff modules are code-split, so the scanner chunk loads only when a seller opens the Caja.
