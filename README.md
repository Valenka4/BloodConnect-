# BloodConnect

BloodConnect is now a full-stack React application with an Express API and Neon PostgreSQL storage.

## Stack

- React + Vite frontend
- Express backend API
- Neon Postgres using `@neondatabase/serverless`
- JWT auth with `bcryptjs`

## Features

- Donor registration with persistent Neon storage
- Login with JWT-based session handling
- Search donors by blood group and city (now with partial matching)
- Post and view emergency blood requests
- Protected dashboard and editable donor profile
- **New**: Premium dark mode support
- **New**: Smooth page transitions and entrance animations
- Refreshed responsive UI built in React

## Project Structure

```text
src/
  components/
  context/
  lib/
  pages/
server/
  middleware/
  scripts/
```

## Environment Setup

Copy `.env.example` to `.env` and fill in real values:

```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@YOUR-NEON-HOST/neondb?sslmode=require
JWT_SECRET=replace-with-a-strong-secret
```

## Install

```bash
npm install
```

## Initialize and Seed the Database

Run these after your Neon database is ready:

```bash
# Create tables
npm run db:init

# (Optional) Add sample donor data
npm run db:seed
```

This creates:

- `users`
- `emergency_requests`

## Start in Development

```bash
npm run dev
```

- React app: `http://localhost:5173`
- API server: `http://localhost:4000`

## Production Build

```bash
npm run build
npm start
```

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/donors`
- `GET /api/emergency-requests`
- `POST /api/emergency-requests`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/dashboard`

## Notes

- Protected endpoints require `Authorization: Bearer <token>`.
- The frontend stores the token in `localStorage`.
- `npm run build` has been verified locally.
- To fully verify database-backed flows, add your real Neon `DATABASE_URL` and run `npm run db:init`.
