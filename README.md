# Sushi Shop Egypt 🍣

منصة ويب متكاملة لمطعم سوشي فاخر في الساحل الشمالي بمصر.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS v4
- **Backend:** Cloudflare Workers + Hono
- **Database:** Supabase PostgreSQL (`soshi` schema on `holol-gym` project)
- **Hosting:** Cloudflare Pages + Workers

## Project Structure

```
SOSHI_EG/
├── frontend/          # React customer/admin/staff UI
├── backend/           # Cloudflare Workers API
├── database/          # schema.sql reference
└── docs/              # Documentation
```

## Database (Supabase)

- **Project:** holol-gym (`khzrapojrkhxjsjgnflr`)
- **Schema:** `soshi`
- **URL:** https://khzrapojrkhxjsjgnflr.supabase.co

### Key Tables

| Table | Purpose |
|-------|---------|
| `customers` | Customer database (visible in admin portal) |
| `customer_sessions` | Email+phone login sessions |
| `otp_codes` | WhatsApp OTP (prepared, not active) |
| `staff_users` | Admin & staff accounts |
| `products` | Menu items (ar/en/ru) |
| `orders` | Customer orders |

## Setup

### 1. Environment Variables

```bash
# backend/.dev.vars
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# frontend/.env
VITE_API_URL=http://localhost:8787
VITE_SUPABASE_URL=https://khzrapojrkhxjsjgnflr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Install & Run

```bash
# Backend
cd backend && npm install
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run dev

# Frontend
cd frontend && npm install
npm run dev
```

### 3. Default Admin

- **Email:** admin@sushishop-egypt.com
- **Password:** Admin@2026

## Customer Login (Current)

Email + phone number only — no OTP verification yet.
Prepared for WhatsApp OTP and Google login in future.

## API Endpoints

```
POST /api/auth/customer/login    # Customer login (email+phone)
POST /api/auth/staff/login       # Admin/staff login
GET  /api/auth/me                # Current session
GET  /api/customers              # Admin: list customers
GET  /api/products               # Public: list products
POST /api/orders                 # Customer: create order
GET  /api/admin/analytics        # Admin: dashboard stats
```

## Deployment

### Frontend → Cloudflare Workers (`soshi-eg`)

Production URL: https://soshi-eg.nvrgvup205.workers.dev

In the Cloudflare dashboard (**Workers & Pages → soshi-eg → Settings → Builds**), use:

**Build command** (optional — can leave empty if deploy handles it):
```bash
npm ci && npm run build
```

**Deploy command** (production branch):
```bash
npm run deploy
```

> Workers Builds does **not** run the `[build]` block from `wrangler.toml`.
> The deploy script installs frontend deps, builds `frontend/dist`, then runs `wrangler deploy`.
> Do **not** set `pages_build_output_dir` in `wrangler.toml` — it makes `wrangler deploy` fail with a Pages-project error.

**GitHub Actions (optional):** add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to enable the Deploy workflow.

**Environment variables** (Cloudflare Worker → Settings → Variables):
- `VITE_API_URL` = your Workers API URL
- `VITE_SUPABASE_URL` = `https://khzrapojrkhxjsjgnflr.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your anon key

### Backend → Cloudflare Workers (`soshi-eg-api`)

```bash
cd backend
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run deploy
```
