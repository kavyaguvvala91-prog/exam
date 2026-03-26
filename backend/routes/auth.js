import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import LoginHistory from "../models/loginHistory.js";
import { getDatabaseStatus, isDatabaseReady } from "../db.js";
import { isValidUsername, normalizeUsername } from "../utils/credential.js";

const router = express.Router();

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(
    { userId: user._id.toString(), username: user.username, role: user.role },
    secret,
    { expiresIn: "1d" }
  );
};

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret);

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const database = getDatabaseStatus();
      return res.status(503).json({
        message: "Database unavailable. Please start MongoDB.",
        database
      });
    }

    const { username, password } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValidUsername(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be in 2451-xx-xxx-xxx format" });
    }

    if (password !== normalizedUsername) {
      return res.status(400).json({ message: "Password must be the same as username" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME || "");
    const role = normalizedUsername === adminUsername ? "admin" : "user";

    const user = new User({
      username: normalizedUsername,
      password: hashedPassword,
      role
    });

    await user.save();

    res.json({ message: "User registered" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username already registered" });
    }

    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const database = getDatabaseStatus();
      return res.status(503).json({
        message: "Database unavailable. Please start MongoDB.",
        database
      });
    }

    const { username, password } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValidUsername(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be in 2451-xx-xxx-xxx format" });
    }

    if (password !== normalizedUsername) {
      return res.status(400).json({ message: "Password must be the same as username" });
    }

    const user = await User.findOne({ username: normalizedUsername });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    user.lastLoginAt = new Date();
    await user.save();
    await LoginHistory.create({
      userId: user._id,
      username: user.username,
      loggedInAt: user.lastLoginAt
    });

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// ADMIN ONLY: view usernames that have logged in
router.get("/logged-users", requireAdmin, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const database = getDatabaseStatus();
      return res.status(503).json({
        message: "Database unavailable. Please start MongoDB.",
        database
      });
    }

    const users = await LoginHistory.find({})
      .select("username loggedInAt -_id")
      .sort({ loggedInAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

export default router;
