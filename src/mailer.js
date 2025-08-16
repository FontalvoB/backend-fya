import nodemailer from "nodemailer";

export function makeTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendCreditEmail({ customerName, amount, agent, createdAt }) {
  const transporter = makeTransporter();
  if (transporter) {
    console.log("[EMAIL-DEMO] → ", { customerName, amount, agent, createdAt });
  
  }
  const to = "hollie.kuhic62@ethereal.email";
  const subject = `Nuevo crédito registrado: ${customerName}`;
  const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" });
  const html = `
    <h2>Registro de Crédito</h2>
    <p><b>Cliente:</b> ${customerName}</p>
    <p><b>Valor:</b> ${formatter.format(Number(amount))}</p>
    <p><b>Comercial:</b> ${agent}</p>
    <p><b>Fecha de registro:</b> ${new Date(createdAt).toLocaleString("es-CO")}</p>
  `;
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}
