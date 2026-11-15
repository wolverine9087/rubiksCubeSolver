import asyncHandler from "../utils/asyncHandler.js";
import { solveCube, isCubeSolved, applyMoves } from "../services/cube.service.js";

export const solveCubeController = asyncHandler(async (req, res) => {
    const { cubeState } = req.body || {};

    if (typeof cubeState !== "string" || !cubeState.trim()) {
        return res.status(400).json({ success: false, message: "Cube state is required" });
    }
    if (cubeState.length !== 54) {
        return res.status(400).json({ success: false, message: "Cube state must contain exactly 54 facelets" });
    }

    let alreadySolved;
    try {
        alreadySolved = isCubeSolved(cubeState);
    } catch {
        return res.status(400).json({ success: false, message: "Invalid cube configuration" });
    }

    let solution = "";
    if (!alreadySolved) {
        try {
            solution = solveCube(cubeState);
            if (!isCubeSolved(applyMoves(cubeState, solution))) throw new Error("Solution verification failed");
        } catch {
            return res.status(400).json({ success: false, message: "Unable to solve this cube configuration" });
        }
    }

    const moveCount = solution.trim() ? solution.trim().split(/\s+/).length : 0;
    return res.status(200).json({
        success: true,
        message: alreadySolved ? "Cube is already solved" : "Cube solved successfully",
        data: { solution, moveCount, alreadySolved }
    });
});
