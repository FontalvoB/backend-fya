import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2d";

export function signJwt(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyJwt(token) {
  return jwt.verify(token, SECRET);
}
