#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies..."
npm ci
npm ci --prefix frontend
npm ci --prefix backend

if [[ ! -f backend/.dev.vars ]]; then
  cp backend/.dev.vars.example backend/.dev.vars
  echo "==> Created backend/.dev.vars — add your SUPABASE_SERVICE_ROLE_KEY"
else
  echo "==> backend/.dev.vars already exists"
fi

if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.example frontend/.env
  echo "==> Created frontend/.env"
else
  echo "==> frontend/.env already exists"
fi

echo ""
echo "Setup complete. Next steps:"
echo "  1. Edit backend/.dev.vars and set SUPABASE_SERVICE_ROLE_KEY"
echo "     (Supabase → Project Settings → API → service_role key)"
echo "  2. Terminal 1: npm run dev:backend   → http://localhost:8787"
echo "  3. Terminal 2: npm run dev:frontend → http://localhost:5173"
echo ""
echo "Production URLs:"
echo "  Frontend: https://soshi-eg.nvrgvup205.workers.dev"
echo "  API:      https://soshi-eg-api.nvrgvup205.workers.dev"
echo ""
echo "Default admin: admin@sushishop-egypt.com / Admin@2026 → /admin/login"
