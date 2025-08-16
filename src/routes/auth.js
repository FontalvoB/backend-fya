import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2d";

const RegisterSchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z.string().min(6)
});

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ ok: false, error: "Email ya registrado" });

    const hash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hash },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ ok: true, user, token });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ ok: false, error: err.issues });
    res.status(500).json({ ok: false, error: "Error al registrar" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ ok: false, error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ ok: false, error: "Credenciales inválidas" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    res.json({ ok: true, user: safeUser, token });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ ok: false, error: err.issues });
    res.status(500).json({ ok: false, error: "Error al iniciar sesión" });
  }
});

export default router;
