/**
 * Logging Router - Central endpoint for microservices logging
 * Provides a single endpoint for all microservices to send their logs
 * to our centralized logging system
 */

import express from "express";
import { logger } from "../logger";

// Initialize Express Router for handling logging endpoints
const router = express.Router();

// POST /log - Endpoint to receive logs from microservices
// Expects: { service: string, level: string, message: string }
router.post("/log", (req, res) => {
  // Extract required fields from request body
  const { service, level, message } = req.body;

  // Validate that all required fields are present
  if (!service || !level || !message) {
    return res.status(400).json({ error: "Missing required log fields" });
  }

  // Log the message using Winston logger
  // Adds timestamp and structures the log entry
  logger.log({
    level,
    service,
    message,
    timestamp: new Date().toISOString(),
  });

  // Confirm log reception to the client
  res.status(200).json({ message: "Log received" });
});

export default router;
