import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { sql } from "./db.js";
import { requireAuth } from "./middleware/auth.js";
import { createToken, sanitizeUser } from "./utils.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your environment first.");
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    message: "BloodConnect API is running.",
    health: "/api/health",
    frontend: "http://localhost:5173"
  });
});

app.get("/api/health", async (_request, response) => {
  try {
    const now = await sql`SELECT NOW() AS timestamp`;
    response.json({ ok: true, timestamp: now[0].timestamp });
  } catch (error) {
    console.error("Health check failed:", error);
    response.status(500).json({ message: "Database connection failed." });
  }
});

app.post("/api/auth/register", async (request, response) => {
  const {
    fullName,
    email,
    password,
    city,
    phone,
    userRole = "donor",
    // Donor specific
    age,
    bloodGroup,
    isAvailable,
    // Bloodbank specific
    licenseNumber,
    // Hospital specific
    registrationNumber,
    isGovernment
  } = request.body;

  if (!fullName || !email || !password || !city || !phone) {
    return response.status(400).json({ message: "Required fields must be filled." });
  }

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length) {
      return response.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Transactional insert (Neon supports standard PG transactions)
    const [user] = await sql.begin(async (sql) => {
      const [u] = await sql`
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          user_role,
          age,
          blood_group,
          city,
          phone,
          is_available
        ) VALUES (
          ${fullName},
          ${email},
          ${passwordHash},
          ${userRole},
          ${age || null},
          ${bloodGroup || null},
          ${city},
          ${phone},
          ${Boolean(isAvailable)}
        )
        RETURNING *
      `;

      if (userRole === "bloodbank") {
        await sql`
          INSERT INTO blood_banks (user_id, license_number)
          VALUES (${u.id}, ${licenseNumber || null})
        `;
      } else if (userRole === "hospital") {
        await sql`
          INSERT INTO hospitals (user_id, registration_number, is_government)
          VALUES (${u.id}, ${registrationNumber || null}, ${Boolean(isGovernment)})
        `;
      }

      return [u];
    });

    return response.status(201).json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Registration error:", error);
    return response.status(500).json({ message: "Failed to create account. Please try again." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body;

  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    return response.json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    return response.status(500).json({ message: "An error occurred during login." });
  }
});

app.get("/api/donors", async (request, response) => {
  const { bloodGroup, city } = request.query;
  let rows;

  try {
    if (bloodGroup && city) {
      rows = await sql`
        SELECT id, full_name, blood_group, city, phone, is_available
        FROM users
        WHERE blood_group = ${bloodGroup}
          AND LOWER(city) LIKE LOWER(${'%' + city + '%'})
        ORDER BY is_available DESC, created_at DESC
      `;
    } else if (bloodGroup) {
      rows = await sql`
        SELECT id, full_name, blood_group, city, phone, is_available
        FROM users
        WHERE blood_group = ${bloodGroup}
        ORDER BY is_available DESC, created_at DESC
      `;
    } else if (city) {
      rows = await sql`
        SELECT id, full_name, blood_group, city, phone, is_available
        FROM users
        WHERE LOWER(city) LIKE LOWER(${'%' + city + '%'})
        ORDER BY is_available DESC, created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT id, full_name, blood_group, city, phone, is_available
        FROM users
        ORDER BY is_available DESC, created_at DESC
        LIMIT 24
      `;
    }

    return response.json({
      donors: rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        bloodGroup: row.blood_group,
        city: row.city,
        phone: row.phone,
        isAvailable: row.is_available
      }))
    });
  } catch (error) {
    console.error("Donor query error:", error);
    return response.status(500).json({ message: "Failed to fetch donors." });
  }
});

app.get("/api/emergency-requests", async (_request, response) => {
  try {
    const rows = await sql`
      SELECT
        emergency_requests.id,
        patient_name,
        blood_group,
        city,
        hospital,
        contact_number,
        notes,
        emergency_requests.created_at,
        users.full_name AS posted_by_name
      FROM emergency_requests
      INNER JOIN users ON users.id = emergency_requests.posted_by
      ORDER BY emergency_requests.created_at DESC
      LIMIT 20
    `;

    return response.json({
      requests: rows.map((row) => ({
        id: row.id,
        patientName: row.patient_name,
        bloodGroup: row.blood_group,
        city: row.city,
        hospital: row.hospital,
        contactNumber: row.contact_number,
        notes: row.notes,
        postedBy: row.posted_by_name,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error("Emergency requests error:", error);
    return response.status(500).json({ message: "Failed to fetch emergency requests." });
  }
});

app.post("/api/emergency-requests", requireAuth, async (request, response) => {
  const { patientName, bloodGroup, city, hospital, contactNumber, notes } = request.body;

  if (!patientName || !bloodGroup || !city || !hospital || !contactNumber) {
    return response.status(400).json({ message: "Please fill every required emergency field." });
  }

  try {
    const [created] = await sql`
      INSERT INTO emergency_requests (
        patient_name,
        blood_group,
        city,
        hospital,
        contact_number,
        notes,
        posted_by
      ) VALUES (
        ${patientName},
        ${bloodGroup},
        ${city},
        ${hospital},
        ${contactNumber},
        ${notes || null},
        ${request.user.id}
      )
      RETURNING id
    `;

    return response.status(201).json({
      message: "Emergency request created.",
      id: created.id
    });
  } catch (error) {
    console.error("Emergency request creation error:", error);
    return response.status(500).json({ message: "Failed to create emergency request." });
  }
});

app.get("/api/profile", requireAuth, async (request, response) => {
  try {
    const [user] = await sql`SELECT * FROM users WHERE id = ${request.user.id}`;
    if (!user) return response.status(404).json({ message: "User not found." });
    return response.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch profile." });
  }
});

app.put("/api/profile", requireAuth, async (request, response) => {
  const { fullName, age, bloodGroup, city, phone, isAvailable } = request.body;

  try {
    const [user] = await sql`
      UPDATE users
      SET
        full_name = ${fullName},
        age = ${age},
        blood_group = ${bloodGroup},
        city = ${city},
        phone = ${phone},
        is_available = ${Boolean(isAvailable)}
      WHERE id = ${request.user.id}
      RETURNING *
    `;

    return response.json({
      message: "Profile updated successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return response.status(500).json({ message: "Failed to update profile." });
  }
});

app.get("/api/dashboard", requireAuth, async (_request, response) => {
  try {
    const [donorCount] = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const [availableCount] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE is_available = TRUE`;
    const [requestCount] = await sql`SELECT COUNT(*)::int AS count FROM emergency_requests`;

    return response.json({
      totalDonors: donorCount.count,
      availableDonors: availableCount.count,
      openEmergencies: requestCount.count
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return response.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
});

app.listen(port, () => {
  console.log(`BloodConnect API running on http://localhost:${port}`);
});

