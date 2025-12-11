import dotenv from "dotenv";
dotenv.config(); // Load .env FIRST

import express from "express";
import bodyParser from "body-parser";
import http from "http";                    // <-- Add this
import trackRouter from "./module/track/route";
import { initDb } from "./module/track/model";
import { initSocket } from "./socket";      // <-- Add this

const app = express();
app.use(bodyParser.json());

app.use("/api/track", trackRouter);

const PORT = Number(process.env.PORT ?? 3000);

async function start() {
  try {
    await initDb();

    // Create raw HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO on this server
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server + WebSocket running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to init DB:", err);
    process.exit(1);
  }
}

start();
