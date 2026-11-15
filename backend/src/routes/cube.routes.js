import express from "express";

import { solveCubeController } from "../controllers/cube.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Solve cube
router.post("/solve", optionalAuth, solveCubeController);

export default router;
