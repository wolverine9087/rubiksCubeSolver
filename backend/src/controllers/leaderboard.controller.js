import LeaderboardEntry from "../models/LeaderboardEntry.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getLeaderboard = asyncHandler(async (req, res) => {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const entries = await LeaderboardEntry.find({ scrambleType: "random" })
        .sort({ timeMs: 1, createdAt: 1 })
        .limit(limit)
        .select("name timeMs moveCount createdAt")
        .lean();

    return res.status(200).json({ success: true, data: { entries } });
});

export const submitLeaderboardEntry = asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const timeMs = Number(req.body?.timeMs);
    const moveCount = Number(req.body?.moveCount);
    const scrambleType = req.body?.scrambleType;

    if (scrambleType !== "random") {
        return res.status(400).json({ success: false, message: "Only random scramble solves can be ranked" });
    }

    if (!name || name.length > 24) {
        return res.status(400).json({ success: false, message: "Enter a name between 1 and 24 characters" });
    }
    if (!Number.isInteger(timeMs) || timeMs < 1 || timeMs > 3600000) {
        return res.status(400).json({ success: false, message: "Solve time must be between 1 millisecond and 1 hour" });
    }
    if (!Number.isInteger(moveCount) || moveCount < 1 || moveCount > 1000) {
        return res.status(400).json({ success: false, message: "Move count must be between 1 and 1000" });
    }

    const entry = await LeaderboardEntry.create({ name, timeMs, moveCount, scrambleType });
    return res.status(201).json({ success: true, data: { entry } });
});
