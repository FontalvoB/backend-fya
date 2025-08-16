let useQueue = false;
let QueueImpl = null;

if (process.env.REDIS_URL) {
  try {
    const { Queue } = await import("bullmq");
    useQueue = true;
    QueueImpl = Queue;
  } catch (e) {
    console.warn("BullMQ no disponible, usando fallback en memoria.");
  }
}

const inMemory = [];

export function getEmailQueue() {
  if (useQueue && QueueImpl) {
    return new QueueImpl("email-queue", { connection: { url: process.env.REDIS_URL } });
  }
  return {
    async add(_name, data) {
      inMemory.push(data);
      setTimeout(async () => {
        const { sendCreditEmail } = await import("../mailer.js");
        for (const job of inMemory.splice(0)) {
          await sendCreditEmail(job);
        }
      }, 0);
    }
  };
}
