import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sql } from "../db.js";

dotenv.config();

const sampleDonors = [
  {
    fullName: "Rahul Sharma",
    age: 28,
    bloodGroup: "O+",
    city: "Mumbai",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    password: "password123",
    isAvailable: true
  },
  {
    fullName: "Priya Singh",
    age: 24,
    bloodGroup: "A-",
    city: "Delhi",
    phone: "+91 98234 56789",
    email: "priya@example.com",
    password: "password123",
    isAvailable: true
  },
  {
    fullName: "Amit Patel",
    age: 35,
    bloodGroup: "B+",
    city: "Mumbai",
    phone: "+91 99001 12233",
    email: "amit@example.com",
    password: "password123",
    isAvailable: false
  },
  {
    fullName: "Sneha Reddy",
    age: 30,
    bloodGroup: "AB+",
    city: "Bengaluru",
    phone: "+91 91234 56780",
    email: "sneha@example.com",
    password: "password123",
    isAvailable: true
  }
];

async function seed() {
  console.log("Seeding sample donors...");
  
  for (const donor of sampleDonors) {
    try {
      const passwordHash = await bcrypt.hash(donor.password, 10);
      await sql`
        INSERT INTO users (
          full_name, age, blood_group, city, phone, email, password_hash, is_available
        ) VALUES (
          ${donor.fullName}, ${donor.age}, ${donor.bloodGroup}, ${donor.city}, 
          ${donor.phone}, ${donor.email}, ${passwordHash}, ${donor.isAvailable}
        )
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (error) {
      console.error(`Failed to seed ${donor.fullName}:`, error.message);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
