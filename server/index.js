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
    
    // Perform inserts sequentially (serverless client doesn't support .begin template)
    const [user] = await sql`
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
          VALUES (${user.id}, ${licenseNumber || null})
        `;
    } else if (userRole === "hospital") {
      await sql`
          INSERT INTO hospitals (user_id, registration_number, is_government)
          VALUES (${user.id}, ${registrationNumber || null}, ${Boolean(isGovernment)})
        `;
    }

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
        emergency_requests.patient_name,
        emergency_requests.blood_group,
        emergency_requests.city,
        emergency_requests.hospital,
        emergency_requests.contact_number,
        emergency_requests.notes,
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
    
    let extraData = {};
    if (user.user_role === 'bloodbank') {
      const [bank] = await sql`SELECT * FROM blood_banks WHERE user_id = ${user.id}`;
      extraData = bank || {};
    } else if (user.user_role === 'hospital') {
      const [hosp] = await sql`SELECT * FROM hospitals WHERE user_id = ${user.id}`;
      extraData = hosp || {};
    }

    return response.json({ user: { ...sanitizeUser(user), ...extraData } });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch profile." });
  }
});

// Blood Bank Stock Management
app.get("/api/bloodbank/stock", requireAuth, async (request, response) => {
  if (request.user.userRole !== 'bloodbank') {
    return response.status(403).json({ message: "Access denied." });
  }
  try {
    const [stock] = await sql`SELECT * FROM blood_banks WHERE user_id = ${request.user.id}`;
    return response.json({ stock });
  } catch (error) {
    console.error("Stock fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch stock." });
  }
});

app.put("/api/bloodbank/stock", requireAuth, async (request, response) => {
  if (request.user.userRole !== 'bloodbank') {
    return response.status(403).json({ message: "Access denied." });
  }
  const {
    stock_a_plus, stock_a_minus, stock_b_plus, stock_b_minus,
    stock_o_plus, stock_o_minus, stock_ab_plus, stock_ab_minus
  } = request.body;

  try {
    await sql`
      UPDATE blood_banks
      SET
        stock_a_plus = ${stock_a_plus},
        stock_a_minus = ${stock_a_minus},
        stock_b_plus = ${stock_b_plus},
        stock_b_minus = ${stock_b_minus},
        stock_o_plus = ${stock_o_plus},
        stock_o_minus = ${stock_o_minus},
        stock_ab_plus = ${stock_ab_plus},
        stock_ab_minus = ${stock_ab_minus},
        last_updated = NOW()
      WHERE user_id = ${request.user.id}
    `;
    return response.json({ message: "Stock updated." });
  } catch (error) {
    console.error("Stock update error:", error);
    return response.status(500).json({ message: "Failed to update stock." });
  }
});

// Partner Directory (Hospitals & Blood Banks)
app.get("/api/partners", async (request, response) => {
  const { city, role } = request.query;
  try {
    // For Neon serverless, we'll use a manually constructed query if dynamic
    // or better, just separate the cases if few
    let partners;
    if (city && role) {
      partners = await sql`
        SELECT u.id, u.full_name, u.city, u.phone, u.user_role,
               b.license_number, h.registration_number, h.is_government
        FROM users u
        LEFT JOIN blood_banks b ON b.user_id = u.id
        LEFT JOIN hospitals h ON h.user_id = u.id
        WHERE u.user_role IN ('bloodbank', 'hospital')
          AND LOWER(u.city) LIKE LOWER(${'%' + city + '%'})
          AND u.user_role = ${role}
      `;
    } else if (city) {
      partners = await sql`
        SELECT u.id, u.full_name, u.city, u.phone, u.user_role,
               b.license_number, h.registration_number, h.is_government
        FROM users u
        LEFT JOIN blood_banks b ON b.user_id = u.id
        LEFT JOIN hospitals h ON h.user_id = u.id
        WHERE u.user_role IN ('bloodbank', 'hospital')
          AND LOWER(u.city) LIKE LOWER(${'%' + city + '%'})
      `;
    } else if (role) {
      partners = await sql`
        SELECT u.id, u.full_name, u.city, u.phone, u.user_role,
               b.license_number, h.registration_number, h.is_government
        FROM users u
        LEFT JOIN blood_banks b ON b.user_id = u.id
        LEFT JOIN hospitals h ON h.user_id = u.id
        WHERE u.user_role IN ('bloodbank', 'hospital')
          AND u.user_role = ${role}
      `;
    } else {
      partners = await sql`
        SELECT u.id, u.full_name, u.city, u.phone, u.user_role,
               b.license_number, h.registration_number, h.is_government
        FROM users u
        LEFT JOIN blood_banks b ON b.user_id = u.id
        LEFT JOIN hospitals h ON h.user_id = u.id
        WHERE u.user_role IN ('bloodbank', 'hospital')
      `;
    }

    return response.json({ partners });
  } catch (error) {
    console.error("Partners fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch partners." });
  }
});

app.put("/api/profile", requireAuth, async (request, response) => {
  // ... existing update logic (simplified for brevity, should be updated to handle types too)
  const { fullName, age, bloodGroup, city, phone, isAvailable } = request.body;

  try {
    const [user] = await sql`
      UPDATE users
      SET
        full_name = ${fullName},
        age = ${age || null},
        blood_group = ${bloodGroup || null},
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
    const [donorCount] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE user_role = 'donor'`;
    const [availableCount] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE is_available = TRUE AND user_role = 'donor'`;
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

