import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 24 },
    timeMs: { type: Number, required: true, min: 1, max: 3600000 },
    moveCount: { type: Number, required: true, min: 1, max: 1000 },
    scrambleType: { type: String, required: true, enum: ["random"] }
}, { timestamps: true });

leaderboardEntrySchema.index({ timeMs: 1, createdAt: 1 });

const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);

export default LeaderboardEntry;
