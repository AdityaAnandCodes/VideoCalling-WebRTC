const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend origin
  methods: ["GET", "POST"],
}));

const server = http.createServer(app);
let io;

export default function handler(req, res) {
  if (req.method === "GET" && req.url === "/") {
    // Provide a simple status message for the root endpoint
    res.setHeader("Content-Type", "text/html");
    res.status(200).send("<h1>Socket.IO Server is Running on Vercel</h1>");
    return;
  }

  if (!io) {
    io = new Server(res.socket.server, {
      cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
      },
    });

    const emailToSocketIdMap = new Map();
    const socketidToEmailMap = new Map();

    io.on("connection", (socket) => {
      console.log(`Socket Connected`, socket.id);

      socket.on("room:join", (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
      });

      socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
      });

      socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      });
    });

    console.log("Socket.IO server initialized.");
    res.socket.server.io = io; // Attach the instance to the server
  }

  res.end();
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});