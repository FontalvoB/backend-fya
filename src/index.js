import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { makeCreditsRouter } from "./routes/credits.js";
import { getEmailQueue } from "./jobs/queue.js";
import { sendCreditEmail } from "./mailer.js";
import authRouter from "./routes/auth.js"; 

const app = express();
const prisma = new PrismaClient();


app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

const emailQueue = getEmailQueue();
app.use("/api/auth", authRouter);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/credits", makeCreditsRouter(express, prisma, emailQueue, sendCreditEmail));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend listo en http://localhost:${PORT}`));
