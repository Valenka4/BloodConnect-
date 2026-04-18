# BloodConnect

BloodConnect is now a full-stack React application with an Express API and Neon PostgreSQL storage.

## Stack

- React + Vite frontend
- Express backend API
- Neon Postgres using `@neondatabase/serverless`
- JWT auth with `bcryptjs`

## Features

- **Multi-Role Support**: specialized interfaces for Donors, Blood Banks, and Hospitals.
- **Inventory Tracking**: Blood Banks can manage real-time inventory levels for all blood groups.
- **Emergency Network**: Hospitals can post urgent patient requirements and search the verified donor network.
- **Partner Directory**: Search and discover registered medical institutions and blood banks by city.
- **Developer Tools**: Seeded dev accounts and quick-login options for rapid prototyping.
- **Design Excellence**: Modern dark-mode compatible UI with smooth Framer Motion animations.
- **Persistent Storage**: Robust data integrity using Neon Serverless PostgreSQL.

## Project Structure

```text
src/
  components/  # Specialized dashboards (BloodBank, Hospital)
  context/     # Auth and Theme management
  lib/         # API clients
  pages/       # Multi-role routing logic
server/
  middleware/  # JWT & Role-based access control
  scripts/     # DB initialization and multi-role seeding
```

## Environment Setup

Copy `.env.example` to `.env` and fill in real values:

```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@YOUR-NEON-HOST/neondb?sslmode=require
JWT_SECRET=replace-with-a-strong-secret
```

## Documentation

Full system diagrams and architectural details are available in:
[System Architecture](file:///C:/Users/Dell/.gemini/antigravity/brain/bc7f8b48-bb93-4e38-b66d-488031586885/system_architecture.md)

## Initialize and Seed the Database

Run these after your Neon database is ready:

```bash
# Create tables and columns (supports updates)
npm run db:init

# Add sample data for all roles (donor, bank, hospital)
npm run db:seed
```

This ensures tables for `users`, `blood_banks`, `hospitals`, and `emergency_requests` are ready.

## Quick Login (Dev)

For testing, use these pre-seeded credentials after running `npm run db:seed`:

- **Donor**: `donor@dev.com` / `password123`
- **Blood Bank**: `bank@dev.com` / `password123`
- **Hospital**: `hospital@dev.com` / `password123`

## Main API Endpoints

- `POST /api/auth/register` - Multi-role registration
- `POST /api/auth/login`
- `GET /api/partners` - Fetch institutions with role filtering
- `GET /api/bloodbank/stock` - Retrieve inventory (Role: Blood Bank)
- `PUT /api/bloodbank/stock` - Update inventory (Role: Blood Bank)
- `GET /api/donors` - Search donor database
- `GET /api/emergency-requests`
- `POST /api/emergency-requests`
- `GET /api/profile` - Detailed role-specific profile
- `GET /api/dashboard` - Stats based on role

## Notes

- Protected endpoints require `Authorization: Bearer <token>`.
- The frontend stores the token in `localStorage`.
- `npm run build` has been verified locally.
- To fully verify database-backed flows, add your real Neon `DATABASE_URL` and run `npm run db:init`.
