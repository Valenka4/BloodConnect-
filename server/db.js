import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("YOUR-NEON-HOST")) {
  console.error("❌ ERROR: DATABASE_URL is missing or using placeholder.");
  console.error("👉 Please paste your Neon Connection String into the .env file.");
  process.exit(1);
}

export const sql = neon(process.env.DATABASE_URL);
