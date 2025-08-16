if (!process.env.REDIS_URL) {
  console.log("Sin REDIS_URL → no se requiere worker separado.");
  process.exit(0);
}

import { Worker } from "bullmq";
import { sendCreditEmail } from "../mailer.js";

const worker = new Worker("email-queue", async job => {
  await sendCreditEmail(job.data);
}, { connection: { url: process.env.REDIS_URL } });

worker.on("ready", () => console.log("Email worker listo."));
worker.on("failed", (job, err) => console.error("Job falló", job?.id, err));
