require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis, client: redisClient } = require("./config/redis");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Redis Adapter for Socket.IO Scaling
const pubClient = redisClient;
const subClient = pubClient.duplicate();

const initIO = async () => {
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));
};

initIO().catch(err => console.error("IO Adapter Error:", err));

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// Database connection
connectDB();
connectRedis();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/status", require("./routes/statusRoutes"));

// Socket.IO
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined room`);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("send_message", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(data.receiverId).emit("receive_message", data);
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.receiverId).emit("display_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.receiverId).emit("hide_typing", data);
  });

  socket.on("mark_seen", (data) => {
    socket.to(data.senderId).emit("message_seen", data);
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
