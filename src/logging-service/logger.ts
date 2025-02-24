// Logger configuration using Winston - our centralized logging setup

// fs-extra: Enhanced file system module that adds extra functionality to Node's native 'fs'
// Provides Promise-based APIs and additional methods for file operations
import fs from "fs-extra";

// path: Node.js built-in module for handling file paths across different operating systems
// Helps create consistent file paths between Windows and Unix-based systems
import path from "path";

// winston: Popular logging library for Node.js that supports multiple logging levels,
// transports (output targets), and formatting options
// Provides a flexible and extensible logging framework
import winston from "winston";

// Logger configuration using Winston - our centralized logging setup

// Create logs directory in the logging-service directory
const logDir = path.join(__dirname, "logs");
fs.ensureDirSync(logDir);

console.log("Logs will be written to:", logDir);

// Define log format
// - timestamp(): Adds ISO timestamp to each log
// - json(): Formats logs as JSON for better parsing
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create a logger instance with two transports:
// 1. Console transport for development debugging
// 2. File transport for persistent logging
export const logger = winston.createLogger({
  level: "info", // Default log level
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Outputs logs to console
    new winston.transports.File({
      dirname: logDir,
      filename: "app.log",
      options: { flags: "a" },
      tailable: true,
    }),
  ],
});

// Log a test message to verify file writing
logger.info("Logger initialized", { service: "logging-service" });
