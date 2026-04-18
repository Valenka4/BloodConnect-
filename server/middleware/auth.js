import jwt from "jsonwebtoken";

export function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authorization required" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = payload;
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}
