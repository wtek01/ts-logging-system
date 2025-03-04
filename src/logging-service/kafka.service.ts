import dotenv from "dotenv";
import { Consumer, Kafka, Producer } from "kafkajs";

dotenv.config();

const kafka = new Kafka({
  clientId: "logging-service",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: "logging-group" });

async function connectWithRetry(
  connectFn: () => Promise<void>,
  maxAttempts = 5
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await connectFn();
      return;
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      console.log(
        `⏳ Retrying connection (attempt ${i + 1}/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export async function connectKafka() {
  try {
    await connectWithRetry(async () => {
      await producer.connect();
      await consumer.connect();
      console.log("✅ Connected to Kafka");
    });
  } catch (error) {
    console.error("❌ Failed to connect to Kafka:", error);
    process.exit(1);
  }
}

export async function disconnectKafka() {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log("✅ Disconnected from Kafka");
  } catch (error) {
    console.error("❌ Error disconnecting from Kafka:", error);
  }
}

export async function sendLogToKafka(
  service: string,
  level: string,
  message: string
) {
  try {
    const logEntry = JSON.stringify({
      service,
      level,
      message,
      timestamp: new Date().toISOString(),
    });

    await producer.send({
      topic: "logs",
      messages: [{ value: logEntry }],
    });

    console.log(`📤 Log sent to Kafka: ${logEntry}`);
  } catch (error) {
    console.error("❌ Error sending log to Kafka:", error);
  }
}
