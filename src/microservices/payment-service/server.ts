import express from "express";
import { sendLog } from "./logger";

const app = express();
app.use(express.json());

app.post("/payment", (req, res) => {
  sendLog("payment-service", "warn", "Payment processing attempt");
  res.json({ message: "Payment processed" });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Payment Service is running on port ${PORT}`);
});
