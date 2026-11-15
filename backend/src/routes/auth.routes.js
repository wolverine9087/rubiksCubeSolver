import express from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// protected routes
router.get("/me", protect, getCurrentUser);

export default router;