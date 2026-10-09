# Reverse Marketplace

A reverse marketplace for Kenya. Buyers post what they need for free, the platform matches the request to subscribed seller companies, and matched companies get an email alert and see the lead on their dashboard. Companies pay for access with M-Pesa.

## Structure
- `client/` React (Vite) front end
- `server/` Node.js + Express API with a MySQL database

## Run locally
1. Start MySQL (for example XAMPP).
2. Server:
   ```
   cd server
   npm install
   copy .env.example .env      (then fill in the values)
   npm run db:init
   npm run db:seed             (optional sample companies)
   npm run dev
   ```
3. Client (second terminal):
   ```
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173

## Features
Buyer requests and automatic matching, company accounts, M-Pesa (Daraja) subscriptions, email lead alerts, password reset, admin dashboard.

## Secrets
Keep `.env` files private. Only `.env.example` is stored in the repository.
