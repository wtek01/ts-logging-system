import { exec, spawn } from "child_process";

// Function to check if Kafka is running
function checkKafka(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("docker ps | findstr kafka", (error) => {
      resolve(!error);
    });
  });
}

// Function to check if Kafka is ready to accept connections
function checkKafkaReady(): Promise<boolean> {
  return new Promise((resolve) => {
    exec(
      "docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092",
      (error) => {
        resolve(!error);
      }
    );
  });
}

// Function to create Docker network if it doesn't exist
async function createNetworkIfNotExists(): Promise<void> {
  return new Promise((resolve) => {
    exec("docker network inspect kafka-net", (error) => {
      if (error) {
        // Network doesn't exist, create it
        exec("docker network create kafka-net", (createError) => {
          if (createError) {
            console.error("❌ Error creating network:", createError);
          } else {
            console.log("✅ Created kafka-net network");
          }
          resolve();
        });
      } else {
        console.log("✅ kafka-net network already exists");
        resolve();
      }
    });
  });
}

// Function to wait for Kafka to be ready
async function waitForKafka(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(
      `⏳ Waiting for Kafka to be ready (attempt ${i + 1}/${maxAttempts})...`
    );
    if (await checkKafkaReady()) {
      console.log("✅ Kafka is ready!");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return false;
}

// Function to start Kafka and Zookeeper
async function startKafka() {
  console.log("🐳 Checking Kafka...");
  const isRunning = await checkKafka();

  if (isRunning) {
    console.log("✅ Kafka is already running");
  } else {
    console.log("🐳 Starting Kafka and Zookeeper...");
    try {
      // Create network if it doesn't exist
      await createNetworkIfNotExists();

      // Start Zookeeper
      exec(
        "docker start zookeeper || docker run -d --name zookeeper --network kafka-net -p 2181:2181 wurstmeister/zookeeper",
        (error, stdout) => {
          if (error) {
            console.error("❌ Error starting Zookeeper:", error);
            return;
          }
          console.log("✅ Zookeeper started:", stdout.trim());
        }
      );

      // Wait for Zookeeper to be ready
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Start Kafka with proper networking configuration
      exec(
        "docker start kafka || docker run -d --name kafka --network kafka-net -p 9092:9092 " +
          "-e KAFKA_BROKER_ID=1 " +
          "-e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 " +
          "-e KAFKA_LISTENERS=PLAINTEXT://:9092 " +
          "-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 " +
          "-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 " +
          "wurstmeister/kafka",
        (error, stdout) => {
          if (error) {
            console.error("❌ Error starting Kafka:", error);
            return;
          }
          console.log("✅ Kafka started:", stdout.trim());
        }
      );

      // Wait for Kafka to be ready
      const isReady = await waitForKafka();
      if (!isReady) {
        throw new Error("Kafka failed to become ready in time");
      }
    } catch (kafkaError) {
      console.error("❌ Error starting Kafka:", kafkaError);
      process.exit(1);
    }
  }
}

// Function to start a service
function startService(name: string, command: string, color: string) {
  console.log(`🚀 Starting service ${color}${name}${"\x1b[0m"}...`);

  const parts = command.split(" ");
  const cmd = parts[0];
  const args = parts.slice(1);

  const process = spawn(cmd, args, {
    stdio: "pipe",
    shell: true,
  });

  process.stdout.on("data", (data) => {
    console.log(`${color}[${name}]${"\x1b[0m"} ${data.toString().trim()}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`${color}[${name}]${"\x1b[0m"} ${data.toString().trim()}`);
  });

  process.on("close", (code) => {
    if (code !== 0) {
      console.log(`${color}[${name}]${"\x1b[0m"} stopped with code ${code}`);
    }
  });

  return process;
}

// Main function
async function main() {
  try {
    // Start Kafka and wait for it to be ready
    await startKafka();

    // Service configuration
    const services = [
      { name: "logging", command: "npm run dev:logging", color: "\x1b[34m" }, // Blue
      { name: "worker", command: "npm run dev:worker", color: "\x1b[32m" }, // Green
      { name: "auth", command: "npm run dev:auth", color: "\x1b[33m" }, // Yellow
      { name: "payment", command: "npm run dev:payment", color: "\x1b[35m" }, // Magenta
      { name: "order", command: "npm run dev:order", color: "\x1b[36m" }, // Cyan
    ];

    // Start all services
    const processes = services.map((service) =>
      startService(service.name, service.command, service.color)
    );

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Stopping all services...");
      processes.forEach((p) => {
        if (!p.killed) {
          p.kill();
        }
      });
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error in main:", error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
