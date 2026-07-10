import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_creato_key_luxury_theme";

export interface SessionUser {
  uid: string;
  email: string;
  role: "CREATOR" | "BRAND" | "ADMIN";
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (e) {
    return null;
  }
}
