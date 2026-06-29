import express from "express";
import { createServer } from "node:http";
import dns from "node:dns";

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set custom DNS servers, using default:", e.message);
}
dns.setDefaultResultOrder("ipv4first");

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./src/controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./src/routes/user.routes.js"

import dotenv from "dotenv";
import { connections } from "./src/controllers/socketManager.js";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or sockets)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "http://localhost:5173",
            "https://video-confressing-5.onrender.com"
        ];
        
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith(".vercel.app") || 
                          /^http:\/\/localhost:\d+$/.test(origin);
                          
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }))

app.use("/api/v1/users", userRoutes);

// Meeting Validation Endpoint

app.get("/api/v1/meetings/:meetingCode", (req, res) => {
    const { meetingCode } = req.params;

    // Check if the meeting code exists in connections and has active participants
    if (connections[meetingCode] && connections[meetingCode].length > 0) {
        return res.status(200).json({ active: true });
    } else {
        return res.status(404).json({ active: false, message: "Meeting not found or inactive" });
    }
});

const start = async () => {

    const connectionDb = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`)

    server.listen(app.get("port"), () => {
        console.log("LISTENING on port 8000")
    });
}

start();