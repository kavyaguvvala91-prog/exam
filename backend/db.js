import mongoose from "mongoose";

const MONGO_RETRY_MS = 5000;
const MONGO_CONNECT_TIMEOUT_MS = 5000;

let retryTimer = null;
let lastDatabaseError = "";

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const getDatabaseStatus = () => ({
  isConnected: isDatabaseReady(),
  readyState: mongoose.connection.readyState,
  databaseName: mongoose.connection.name || "",
  host: mongoose.connection.host || "",
  error: lastDatabaseError
});

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    lastDatabaseError = "Missing MONGO_URI in backend/.env";
    console.error(`${lastDatabaseError}. Backend will run without database.`);
    return;
  }

  if (isDatabaseReady() || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: MONGO_CONNECT_TIMEOUT_MS
    });
    lastDatabaseError = "";
    console.log(`MongoDB connected to ${mongoose.connection.name || "database"}`);
  } catch (err) {
    lastDatabaseError = err.message;
    console.error(
      `Database connection failed: ${err.message}. Retrying in ${MONGO_RETRY_MS / 1000}s...`
    );

    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectToDatabase();
      }, MONGO_RETRY_MS);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  if (!lastDatabaseError) {
    lastDatabaseError = "MongoDB disconnected";
  }
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  lastDatabaseError = err.message;
  console.error("MongoDB error:", err.message);
});
