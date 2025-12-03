import dotenv from "dotenv";
dotenv.config(); // Load .env FIRST

import express from "express";
import bodyParser from "body-parser";
import trackRouter from "./module/track/route";
import { initDb } from "./module/track/model";

const app = express();
app.use(bodyParser.json());

app.use("/api/track", trackRouter);

const PORT = process.env.PORT ?? 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to init DB:", err);
    process.exit(1);
  });
