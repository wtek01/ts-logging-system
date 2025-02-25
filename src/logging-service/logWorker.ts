import dotenv from "dotenv";
import fs from "fs-extra";
import Redis from "ioredis";
import path from "path";
import winston from "winston";

dotenv.config();

// Redis Client Setup
const redis = new Redis({ host: "127.0.0.1", port: 6379 });
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));

// Ensure logs directory exists
const logDir = path.join(__dirname, "logs");
fs.ensureDirSync(logDir);

// Winston File Logger Configuration
const fileLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
    }),
  ],
});

// Function to process logs from Redis Stream
async function processLogs() {
  console.log("🔄 Log worker started...");

  while (true) {
    try {
      const logs = await redis.xread("BLOCK", 0, "STREAMS", "logs-stream", "$");

      if (logs) {
        for (const [, entries] of logs) {
          for (const [id, entry] of entries) {
            const logData = JSON.parse(entry[1]);

            // Apply filtering (only store logs above 'warn' level)
            if (["warn", "error"].includes(logData.level)) {
              fileLogger.log(logData);
              console.log(`✅ Log processed: ${logData.message}`);
            } else {
              console.log(`🟡 Ignored low-priority log: ${logData.message}`);
            }

            // Acknowledge log entry
            await redis.xdel("logs-stream", id);
          }
        }
      }
    } catch (err) {
      console.error("❌ Log processing error:", (err as Error).message);
    }
  }
}

// Start log processing worker
processLogs();
