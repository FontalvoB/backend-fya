import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function authenticateJWT(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: "Token requerido" });

  try {
    const payload = jwt.verify(token, SECRET); // { id, email, role }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Token inválido o expirado" });
  }
}
