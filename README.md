# ORIGEN

Web app for **ORIGEN**, a healthy bowl restaurant in Bogotá ([soyorigen.co](https://soyorigen.co)). Built with React + Vite, deployed on Vercel, with Supabase as the backend and Claude AI as the nutritional advisor.

## Features

- **Menu & ordering** — browse 12 signature bowls and drinks, add to cart, confirm via WhatsApp
- **Bowl builder** — 7-step custom bowl creator with live SVG preview
- **Multi-channel orders** — `pickup` (in-store, bound to a specific sede) vs `delivery`/online (domicilio today; extensible to Rappi/Didi via `source` + `external_ref` + `channel_meta`)
- **QR pay/pickup flow** — pickup customers generate a QR at checkout; the seller for that sede scans it at the counter to mark as delivered
- **Savia AI advisor** — chat-based nutritional advisor powered by Claude Haiku (`/api/chat`)
- **Loyalty points** — earned automatically on every confirmed order
- **Order history** — authenticated customers view their full order history with item breakdown
- **Seller (Caja) module** — role-gated QR scanner + manual code search; sellers log straight into it and have no shopping cart. Includes a sede-scoped order history with status (all / scanned / scanned+paid) and timeframe (today / 1h / 3h / 12h) filters
- **Admin dashboard** — realtime KPIs, on-brand SVG charts, sales filters, and order management

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) |
| AI | Anthropic Claude Haiku via Vercel serverless function |
| Deployment | Vercel (static SPA + `api/` serverless functions) |
| QR | `html5-qrcode` (scanning), `qrcode` (generation) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Setup

```bash
git clone <repo-url>
cd origen-web
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
ANTHROPIC_API_KEY=sk-ant-...
```

### Database

Paste `supabase-setup.sql` into **Supabase → SQL Editor → Run** for the baseline schema (idempotent — safe on fresh and existing databases). Section 15 adds the **multi-channel orders** layer (`channel` discriminator, the `locales` sede table + `local_id` FKs, online-order fields, pickup/delivery CHECK constraints).

> **Staff/customer split (applied beyond `supabase-setup.sql`).** The live DB has since been refactored via three tracked Supabase migrations — `staff_empleados_refactor`, `clientes_customer_only_role`, `harden_seller_rpc_grants`. They split identity into two tables: **`clientes`** (customers; renamed from `profiles`, role locked to `customer`) and **`empleados`** (staff: `id_local` sede FK + `rol` of `seller`/`admin`, where `id_local IS NULL` = global admin). All role helpers (`is_admin`/`is_seller`), `set_order_delivered`, and the seller RLS now read `empleados`. New `seller_get_order` / `seller_list_orders` RPCs power the Caja search + history, and `orders.scanned_at`/`scanned_por` track caja activity.

After applying any schema change, reload the API cache so new columns are exposed:

```sql
NOTIFY pgrst, 'reload schema';
```

### Run

```bash
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Staff Roles

Identity is split across two tables. Customers live in **`clientes`** (role always `customer`); staff live in **`empleados`**. A given auth user is one or the other — never both. Staff must **re-login** after being added to `empleados` so the app reloads their role.

| Who | Source | Access |
|---|---|---|
| Customer | `clientes` row | Menu, ordering, cart, order history |
| `seller` | `empleados` (`rol='seller'`, `id_local` set) | Caja: QR scanner + manual search + sede history. **No shopping cart** |
| `admin` | `empleados` (`rol='admin'`, `id_local=NULL`) | Full dashboard + order management; sees every sede |

On login a **seller is redirected straight to the Caja (Ventas) module** and all purchasing UI (cart, checkout) is hidden. A seller is bound to **one sede** via `empleados.id_local`; cross-location RLS means a Caja only sees and can charge orders for its own sede. `id_local IS NULL` denotes a **global admin** ( `0` cannot be used because it would violate the FK to `locales`).

| Sede | `locales.name` | `empleados.id_local` |
|---|---|---|
| Salitre Plaza | `CC salitre Plaza` | `1` |
| Avenida Chile | `CC av chile` | `2` |
| Nuestro Bogotá | `CC Nuestro Bogota` | `3` |

To add staff: create the Supabase Auth user (email-confirmed), then insert a row into `public.empleados (id, id_local, rol)` using their `auth.users.id`. Staff login credentials (emails + passwords) are kept in the team's local, untracked DB notes (`context_base.md`) — **never** committed to this repo.

## Project Structure

```
src/
├── App.jsx                  # Tab routing, global state, modal orchestration
├── constants/               # Menu data, store locations, brand copy, media URLs
├── features/
│   ├── cart/useCart.js      # Cart state, QR pay flows, WhatsApp order confirm
│   └── admin/useAnalytics.js
├── pages/
│   ├── Inicio/              # Home
│   ├── Carta/               # Menu grid
│   ├── Builder/             # Custom bowl builder
│   ├── Historial/           # Order history (auth-gated)
│   ├── Seller/              # Caja — QR scanner (role-gated, lazy-loaded)
│   └── Admin/               # Dashboard (role-gated, lazy-loaded)
├── components/
│   ├── CheckoutModal.jsx    # Checkout + QR pay/pickup flow
│   ├── AuthModal.jsx        # Login / register
│   ├── SaviaWidget.jsx      # AI chat advisor
│   └── admin/OrderManager.jsx
├── contexts/AuthContext.jsx  # Session + clientes/empleados → role, sede, loyalty points
└── lib/
    ├── supabase.js
    └── database.js          # All Supabase queries and RPCs
```

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase public anon key |
| `ANTHROPIC_API_KEY` | Vercel serverless (`api/chat.js`) | Claude API key — never exposed to the browser |

**Never commit `.env`** — only `.env.example` is tracked.

## Deployment

Push to the Vercel-connected branch. The `api/` directory is picked up automatically as serverless functions. Set the three environment variables in the Vercel project settings.
