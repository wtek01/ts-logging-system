/**
 * Kafka Service
 * Handles all Kafka-related operations including connection management,
 * message production, and consumer setup for the logging system.
 */

import dotenv from "dotenv";
import { Consumer, Kafka, Producer } from "kafkajs";

dotenv.config();

// Kafka configuration
const KAFKA_TOPIC = "logs";
const KAFKA_PARTITIONS = 1;
const KAFKA_REPLICATION_FACTOR = 1;

// Initialize Kafka client with retry configuration for better reliability
const kafka = new Kafka({
  clientId: "logging-service",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Create producer and consumer instances
export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: "logging-group" });

/**
 * Creates a Kafka topic if it doesn't exist
 * Uses the admin client to manage topics
 */
export async function createTopicIfNotExists() {
  const admin = kafka.admin();
  try {
    await admin.connect();
    const topics = await admin.listTopics();

    if (!topics.includes(KAFKA_TOPIC)) {
      await admin.createTopics({
        topics: [
          {
            topic: KAFKA_TOPIC,
            numPartitions: KAFKA_PARTITIONS,
            replicationFactor: KAFKA_REPLICATION_FACTOR,
          },
        ],
      });
      console.log(`✅ Created topic: ${KAFKA_TOPIC}`);
    } else {
      console.log(`ℹ️ Topic ${KAFKA_TOPIC} already exists`);
    }
  } catch (error) {
    console.error("❌ Error creating topic:", error);
    throw error;
  } finally {
    await admin.disconnect();
  }
}

/**
 * Retry mechanism for Kafka operations
 * Attempts to execute a connection function multiple times with delays
 */
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

/**
 * Establishes connection to Kafka with retry mechanism
 * Connects both producer and consumer and ensures topic exists
 */
export async function connectKafka() {
  try {
    await connectWithRetry(async () => {
      await producer.connect();
      await consumer.connect();
      await createTopicIfNotExists();
      console.log("✅ Connected to Kafka");
    });
  } catch (error) {
    console.error("❌ Failed to connect to Kafka:", error);
    process.exit(1);
  }
}

/**
 * Gracefully disconnects from Kafka
 * Ensures both producer and consumer are properly closed
 */
export async function disconnectKafka() {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log("✅ Disconnected from Kafka");
  } catch (error) {
    console.error("❌ Error disconnecting from Kafka:", error);
  }
}

/**
 * Sends a log message to Kafka
 * Formats the log entry and publishes it to the 'logs' topic
 */
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
      topic: KAFKA_TOPIC,
      messages: [{ value: logEntry }],
    });

    console.log(`📤 Log sent to Kafka: ${logEntry}`);
  } catch (error) {
    console.error("❌ Error sending log to Kafka:", error);
  }
}
