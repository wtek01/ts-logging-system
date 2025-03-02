import { exec, spawn } from "child_process";

// Fonction pour vérifier si Redis est en cours d'exécution
function checkRedis(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("docker ps | findstr redis", (error) => {
      resolve(!error);
    });
  });
}

// Fonction pour démarrer Redis
async function startRedis() {
  console.log("🐳 Vérification de Redis...");
  const isRunning = await checkRedis();

  if (isRunning) {
    console.log("✅ Redis est déjà en cours d'exécution");
  } else {
    console.log("🐳 Démarrage de Redis...");
    try {
      exec(
        "docker start redis || docker run -d --name redis -p 6379:6379 redis",
        (error, stdout) => {
          if (error) {
            console.error("❌ Erreur lors du démarrage de Redis:", error);
            return;
          }
          console.log("✅ Redis démarré:", stdout.trim());
        }
      );
      // Attendre que Redis démarre
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (redisError) {
      console.error("❌ Erreur lors du démarrage de Redis:", redisError);
      process.exit(1);
    }
  }
}

// Fonction pour démarrer un service
function startService(name: string, command: string, color: string) {
  console.log(`🚀 Démarrage du service ${color}${name}${"\x1b[0m"}...`);

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
      console.log(
        `${color}[${name}]${"\x1b[0m"} s'est arrêté avec le code ${code}`
      );
    }
  });

  return process;
}

// Fonction principale
async function main() {
  // Démarrer Redis
  await startRedis();

  // Configuration des services
  const services = [
    { name: "logging", command: "npm run dev:logging", color: "\x1b[34m" }, // Bleu
    { name: "worker", command: "npm run dev:worker", color: "\x1b[32m" }, // Vert
    { name: "auth", command: "npm run dev:auth", color: "\x1b[33m" }, // Jaune
    { name: "payment", command: "npm run dev:payment", color: "\x1b[35m" }, // Magenta
    { name: "order", command: "npm run dev:order", color: "\x1b[36m" }, // Cyan
  ];

  // Démarrer tous les services
  const processes = services.map((service) =>
    startService(service.name, service.command, service.color)
  );

  // Gérer l'arrêt propre
  process.on("SIGINT", () => {
    console.log("\n🛑 Arrêt de tous les services...");
    processes.forEach((p) => {
      if (!p.killed) {
        p.kill();
      }
    });
    process.exit(0);
  });
}

// Exécuter la fonction principale
main().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
