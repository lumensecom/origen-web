# ORIGEN

Web app for **ORIGEN**, a healthy bowl restaurant in Bogotá ([soyorigen.co](https://soyorigen.co)). Built with React + Vite, deployed on Vercel, with Supabase as the backend and Claude AI as the nutritional advisor.

## Features

- **Menu & ordering** — browse 12 signature bowls and drinks, add to cart, confirm via WhatsApp
- **Bowl builder** — 7-step custom bowl creator with live SVG preview
- **QR pay/pickup flow** — in-store customers generate a QR at checkout; sellers scan it at the counter to mark as delivered
- **Savia AI advisor** — chat-based nutritional advisor powered by Claude Haiku (`/api/chat`)
- **Loyalty points** — earned automatically on every confirmed order
- **Order history** — authenticated customers view their full order history with item breakdown
- **Seller (Caja) module** — role-gated QR scanner for in-store payment processing
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

Paste `supabase-setup.sql` into **Supabase → SQL Editor → Run**. The script is idempotent — safe on both fresh and existing databases. To assign staff roles use the snippets at the bottom of that file.

### Run

```bash
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Staff Roles

Roles are set on `profiles.role` in Supabase. Staff must **re-login** after a role is assigned.

| Role | Access | Notes |
|---|---|---|
| `customer` | Default | Assigned automatically on signup |
| `seller` | Caja / QR scanner | Also requires `seller_location` matching a store name exactly |
| `admin` | Full dashboard + order management | Bypasses all seller guards |

Store names for `seller_location`: `CC Salitre Plaza`, `Av. Chile — Local 408B`, `CC Nuestro Bogotá`

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
├── contexts/AuthContext.jsx  # Session, profile, role, loyalty points
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
