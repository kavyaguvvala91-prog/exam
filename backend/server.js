import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { connectToDatabase, getDatabaseStatus } from "./db.js";

dotenv.config();

const app = express();
const DEFAULT_PORT = 5000;
const MAX_PORT_ATTEMPTS = 20;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  }
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  const database = getDatabaseStatus();

  res.status(database.isConnected ? 200 : 503).json({
    status: database.isConnected ? "ok" : "degraded",
    database
  });
});

// routes
app.use("/api/auth", authRoutes);

const startListening = (port, attempt = 0) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectToDatabase();
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (attempt >= MAX_PORT_ATTEMPTS) {
        console.error(
          `Unable to find an open port after ${MAX_PORT_ATTEMPTS + 1} attempts starting at ${PORT}.`
        );
        process.exit(1);
      }

      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
      startListening(nextPort, attempt + 1);
      return;
    }

    console.error("Server startup error:", err.message);
    process.exit(1);
  });
};

startListening(PORT);
