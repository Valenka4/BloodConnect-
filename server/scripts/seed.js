import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sql } from "../db.js";

dotenv.config();

const sampleUsers = [
  {
    fullName: "Rahul Sharma",
    age: 28,
    bloodGroup: "O+",
    city: "Mumbai",
    phone: "+91 98765 43210",
    email: "donor@dev.com",
    password: "password123",
    isAvailable: true,
    userRole: "donor"
  },
  {
    fullName: "City Life Blood Bank",
    city: "Mumbai",
    phone: "+91 22 4455 6677",
    email: "bank@dev.com",
    password: "password123",
    userRole: "bloodbank",
    licenseNumber: "BB-123456"
  },
  {
    fullName: "Apex General Hospital",
    city: "Delhi",
    phone: "+91 11 2233 4455",
    email: "hospital@dev.com",
    password: "password123",
    userRole: "hospital",
    registrationNumber: "HOSP-9988",
    isGovernment: true
  }
];

async function seed() {
  console.log("Seeding multi-role users...");
  
  for (const user of sampleUsers) {
    try {
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      const [u] = await sql`
        INSERT INTO users (
          full_name, age, blood_group, city, phone, email, password_hash, is_available, user_role
        ) VALUES (
          ${user.fullName}, ${user.age || null}, ${user.bloodGroup || null}, ${user.city}, 
          ${user.phone}, ${user.email}, ${passwordHash}, ${user.isAvailable ?? true}, ${user.userRole}
        )
        ON CONFLICT (email) DO UPDATE 
        SET full_name = EXCLUDED.full_name
        RETURNING id
      `;

      if (user.userRole === "bloodbank") {
        await sql`
          INSERT INTO blood_banks (user_id, license_number, stock_a_plus, stock_o_plus)
          VALUES (${u.id}, ${user.licenseNumber}, 10, 25)
          ON CONFLICT (user_id) DO NOTHING
        `;
      } else if (user.userRole === "hospital") {
        await sql`
          INSERT INTO hospitals (user_id, registration_number, is_government)
          VALUES (${u.id}, ${user.registrationNumber}, ${user.isGovernment})
          ON CONFLICT (user_id) DO NOTHING
        `;
      }

      console.log(`✅ Seeded ${user.userRole}: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to seed ${user.email}:`, error.message);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
