import axios from "axios";

export function sendLog(service: string, level: string, message: string) {
  axios
    .post("http://localhost:4000/api/log", { service, level, message })
    .catch((err) => console.error("❌ Failed to send log:", err.message));
}
