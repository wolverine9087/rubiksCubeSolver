import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import cubeRoutes from "./routes/cube.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

// Import error middleware
import {
    notFound,
    errorHandler
} from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
    origin: [
        "https://rubiks-cube-solver-alpha-two.vercel.app",
        "https://rubiks-cube-solver-dkn8543uk-ayush-cbb1.vercel.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cube", cubeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// A same-origin endpoint for frontend and deployment health checks.
app.get("/api/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    return res.status(200).json({
        success: true,
        api: "ok",
        database: databaseConnected ? "connected" : "disconnected"
    });
});

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Rubik's Cube Solver API is running"
    });
});

// Handle undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
