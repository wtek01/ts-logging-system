import fs from "fs-extra";
import path from "path";
import { consumer } from "./kafka.service";

const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

// Ensure log directory exists
fs.ensureDirSync(LOG_DIR);

async function processLog(logEntry: string) {
  try {
    const log = JSON.parse(logEntry);
    const { service, level, message, timestamp } = log;

    const logLine =
      JSON.stringify({
        level,
        message,
        service,
        timestamp,
      }) + "\n";

    await fs.appendFile(LOG_FILE, logLine);
    console.log(`📝 Log written to app.log`);
  } catch (error) {
    console.error("❌ Error processing log:", error);
  }
}

async function startLogWorker() {
  try {
    console.log("🚀 Starting log worker...");

    // Subscribe to the logs topic
    await consumer.subscribe({ topic: "logs" });

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          await processLog(message.value.toString());
        }
      },
    });

    console.log("✅ Log worker is running");
  } catch (error) {
    console.error("❌ Error in log worker:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down log worker...");
  await consumer.disconnect();
  process.exit(0);
});

startLogWorker();
