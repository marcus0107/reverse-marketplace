# Reverse — Server (Node.js + Express + MySQL)

## Setup
1. Install Node 18+ and MySQL 8 (or XAMPP's MySQL).
2. `npm install`
3. Copy `.env.example` to `.env`, then set `DB_PASSWORD` and a long random `JWT_SECRET`.
4. `npm run db:init`  creates the database and tables
5. `npm run db:seed`  optional sample companies (login `seed1@demo.test` / `demo12345`)
6. `npm run dev`  server on http://localhost:3000 (test: http://localhost:3000/api/health)

## API
- POST /api/auth/signup | login | logout, GET /api/auth/me
- POST /api/requests (public), GET /api/requests/:token
- GET /api/companies/:id (public)
- GET /api/companies/me/dashboard, PUT /api/companies/me, PATCH /api/companies/me/leads/:id (login required)

## Files
- server.js — app setup, security headers, rate limits
- src/db.js — MySQL connection · src/auth.js — JWT cookie login
- src/matching.js — buyer-to-company scoring · src/routes/ — API endpoints
- db/schema.sql — tables · scripts/ — init-db and seed
