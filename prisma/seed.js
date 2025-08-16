import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const creditRows = [
  { customerName: "Pepito Perez", customerId: "CC-0001", amount: 7800000, termMonths: 10, interestRate: 0.02, agent: "Comercial 1" },
  { customerName: "Maria Perez", customerId: "CC-0002", amount: 12500000, termMonths: 5, interestRate: 0.02, agent: "Comercial 2" },
  { customerName: "Antonio Rodriguez", customerId: "CC-0003", amount: 10312673, termMonths: 5, interestRate: 0.02, agent: "Comercial 1" },
  { customerName: "Giselle López", customerId: "CC-0004", amount: 8628510, termMonths: 12, interestRate: 0.02, agent: "Comercial 2" },
  { customerName: "Martha Perez", customerId: "CC-0005", amount: 5889085, termMonths: 24, interestRate: 0.02, agent: "Comercial 3" },
  { customerName: "Isaac Llanos", customerId: "CC-0006", amount: 14793565, termMonths: 48, interestRate: 0.02, agent: "Comercial 1" },
  { customerName: "Teresa Gutierrez", customerId: "CC-0007", amount: 8072348, termMonths: 50, interestRate: 0.02, agent: "Comercial 2" },
  { customerName: "Isabel Llanos", customerId: "CC-0008", amount: 5143860, termMonths: 60, interestRate: 0.02, agent: "Comercial 3" },
  { customerName: "Paola Tao", customerId: "CC-0009", amount: 12881963, termMonths: 24, interestRate: 0.02, agent: "Comercial 1" },
  { customerName: "Wendy Moscoso", customerId: "CC-0010", amount: 13484682, termMonths: 40, interestRate: 0.02, agent: "Comercial 2" }
];

async function main() {
  await prisma.credit.createMany({
    data: creditRows.map(r => ({ ...r, amount: r.amount })),
    skipDuplicates: true,
  });

  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@fya.local";
  const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const password = await bcrypt.hash(rawPassword, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, password}
  });

  console.log(`Seed OK → Usuario: ${email} / Pass: ${rawPassword}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
