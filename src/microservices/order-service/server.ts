import express from "express";
import { sendLog } from "./logger";

const app = express();
app.use(express.json());

app.post("/order", (req, res) => {
  sendLog("order-service", "error", "New order created");
  res.json({ message: "Order created" });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🚀 Order Service is running on port ${PORT}`);
});
