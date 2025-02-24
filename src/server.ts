import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Logging Service is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
