import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/utils/socket.js";

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make socket.io instance accessible globally via app set
app.set("io", io);

// Initialize custom Socket connection events and routing
initSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});