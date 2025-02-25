import dotenv from "dotenv";
import Redis from "ioredis";
import winston from "winston";

dotenv.config();

// Redis Client Setup
const redis = new Redis({ host: "127.0.0.1", port: 6379 });
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));

// Winston Logger Configuration
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Function to push logs to Redis Stream
export async function pushLogToQueue(
  service: string,
  level: string,
  message: string
) {
  const logEntry = JSON.stringify({
    service,
    level,
    message,
    timestamp: new Date().toISOString(),
  });

  await redis.xadd("logs-stream", "*", "log", logEntry);
  console.log(`📤 Log sent to Redis queue: ${logEntry}`);
}
