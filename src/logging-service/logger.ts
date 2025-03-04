import dotenv from "dotenv";
import winston from "winston";
import { connectKafka, sendLogToKafka } from "./kafka.service";

dotenv.config();

// Connect to Kafka
connectKafka();

// Winston Logger Configuration
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Function to push logs to Kafka
export async function pushLogToQueue(
  service: string,
  level: string,
  message: string
) {
  await sendLogToKafka(service, level, message);
}
