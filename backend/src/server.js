import dns from "node:dns";
import { createServer } from "node:http";

// Set DNS servers
dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

import {
    initializeCubeSolver
} from "./services/cube.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // The cube solver is stateless, so guest solves can still work if the
    // optional database is temporarily unavailable.
    initializeCubeSolver();

    try {
        await connectDB();
    } catch (error) {
        console.warn("Starting API without MongoDB. Account sign-in needs a database connection.");
    }

    const server = createServer(app);

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.error(
                `Port ${PORT} is already in use. Stop the other server or start this one with a different PORT (for example, PORT=5001).`
            );
            process.exitCode = 1;
            return;
        }

        console.error("Failed to start the server:", error);
        process.exitCode = 1;
    });

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
