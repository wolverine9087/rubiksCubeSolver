import express from "express";
import { getLeaderboard, submitLeaderboardEntry } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.post("/", submitLeaderboardEntry);

export default router;
