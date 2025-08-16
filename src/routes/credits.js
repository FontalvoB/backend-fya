// backend/src/routes/credits.js
import { z } from "zod";
import dayjs from "dayjs";
import { authenticateJWT } from "../middleware/auth.js"; // 👈 IMPORTANTE

export function makeCreditsRouter(express, prisma, queue, sendEmailFn) {
  const router = express.Router();

  const CreditSchema = z.object({
    customerName: z.string().min(3),
    customerId: z.string().min(3),
    amount: z.number().positive(),
    interestRate: z.number().min(0),
    termMonths: z.number().int().positive(),
    agent: z.string().min(2)
  });

  // protegido con JWT
  router.post("/", authenticateJWT, async (req, res) => {
    try {
      const parsed = CreditSchema.parse(req.body);
      const created = await prisma.credit.create({ data: parsed });

      const payload = {
        customerName: created.customerName,
        amount: created.amount,
        agent: created.agent,
        createdAt: created.createdAt
      };
      if (queue) await queue.add("credit-registered", payload);
      else await sendEmailFn(payload);

      return res.status(201).json({ ok: true, credit: created });
    } catch (err) {
      if (err?.issues) return res.status(400).json({ ok: false, error: err.issues });
      console.error(err);
      return res.status(500).json({ ok: false, error: "Error inesperado" });
    }
  });

  router.get("/", async (req, res) => {
    const { name, id, agent, sortBy = "createdAt", order = "desc" } = req.query;
    const where = {
      AND: [
        name ? { customerName: { contains: String(name), mode: "insensitive" } } : {},
        id ? { customerId: { contains: String(id), mode: "insensitive" } } : {},
        agent ? { agent: { contains: String(agent), mode: "insensitive" } } : {}
      ]
    };
    const orderBy = [
      sortBy === "amount" ? { amount: order === "asc" ? "asc" : "desc" } : { createdAt: order === "asc" ? "asc" : "desc" }
    ];
    const data = await prisma.credit.findMany({ where, orderBy });
    res.json({ ok: true, credits: data });
  });

  return router;
}
