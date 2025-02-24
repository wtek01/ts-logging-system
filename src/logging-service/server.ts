/**
 * Logging Service Server
 * Main entry point for the centralized logging system
 * Sets up Express server to receive and process logs from microservices
 */

import dotenv from "dotenv";
import express from "express";
import logRouter from "./routes/logRouter";

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount logging routes under /api endpoint
// All logging-related endpoints will be prefixed with /api
app.use("/api", logRouter);

// Start the server
const PORT = process.env.LOGGING_SERVICE_PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Logging Service is running on port ${PORT}`);
});
