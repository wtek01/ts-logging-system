import express from "express";
import { sendLog } from "./logger";

const app = express();
app.use(express.json());

app.post("/login", (req, res) => {
  sendLog("auth-service", "error", "User login attempt");
  res.json({ message: "User logged in" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Auth Service is running on port ${PORT}`);
});
