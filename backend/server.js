import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { connectToDatabase, getDatabaseStatus } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
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

const startListening = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectToDatabase();
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Free it and restart the backend.`);
      process.exit(1);
      return;
    }

    console.error("Server startup error:", err.message);
    process.exit(1);
  });
};

startListening(PORT);
