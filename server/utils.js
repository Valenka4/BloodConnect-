import jwt from "jsonwebtoken";

export function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

export function sanitizeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    bloodGroup: row.blood_group,
    city: row.city,
    phone: row.phone,
    email: row.email,
    userRole: row.user_role,
    isAvailable: row.is_available,
    createdAt: row.created_at
  };
}
