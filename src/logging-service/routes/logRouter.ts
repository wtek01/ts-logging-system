import express from "express";
import { pushLogToQueue } from "../logger";

const router = express.Router();

// POST /log - Send logs to Redis queue
router.post("/log", async (req, res) => {
  const { service, level, message } = req.body;

  if (!service || !level || !message) {
    return res.status(400).json({ error: "Missing required log fields" });
  }

  await pushLogToQueue(service, level, message);
  res.status(200).json({ message: "Log sent to queue" });
});

export default router;
