import dotenv from "dotenv";
import { sql } from "../db.js";

dotenv.config();

async function init() {
  // Ensure users table exists with all needed columns
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      user_role TEXT NOT NULL DEFAULT 'donor',
      age INTEGER,
      blood_group TEXT,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Update existing users table if columns are missing
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role TEXT NOT NULL DEFAULT 'donor'`;
    await sql`ALTER TABLE users ALTER COLUMN age DROP NOT NULL`;
    await sql`ALTER TABLE users ALTER COLUMN blood_group DROP NOT NULL`;
  } catch (err) {
    console.log("Note: Some ALTER TABLE commands might have skipped if already applied.");
  }

  await sql`
    CREATE TABLE IF NOT EXISTS blood_banks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      license_number TEXT,
      stock_a_plus INTEGER DEFAULT 0,
      stock_a_minus INTEGER DEFAULT 0,
      stock_b_plus INTEGER DEFAULT 0,
      stock_b_minus INTEGER DEFAULT 0,
      stock_o_plus INTEGER DEFAULT 0,
      stock_o_minus INTEGER DEFAULT 0,
      stock_ab_plus INTEGER DEFAULT 0,
      stock_ab_minus INTEGER DEFAULT 0,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      registration_number TEXT,
      is_government BOOLEAN DEFAULT FALSE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS emergency_requests (
      id SERIAL PRIMARY KEY,
      patient_name TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      city TEXT NOT NULL,
      hospital TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      notes TEXT,
      posted_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Database tables are ready.");
}

init().catch((error) => {
  console.error(error);
  process.exit(1);
});
