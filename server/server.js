require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis, client: redisClient, getIsRedisConnected } = require("./config/redis");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Redis Adapter for Socket.IO Scaling
const initIO = async () => {
  try {
    const isConnected = await connectRedis();
    if (isConnected) {
      const pubClient = redisClient;
      const subClient = pubClient.duplicate();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis Adapter applied");
    } else {
      console.log("Socket.IO running without Redis scaling (local mode)");
    }
  } catch (err) {
    console.error("IO Adapter initialization skipped:", err.message);
  }
};

initIO();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.static('public'));

// Database connection
connectDB().then(() => {
  const seedDemoData = require("./config/seed");
  seedDemoData();
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/status", require("./routes/statusRoutes"));
app.use("/api/channels", require("./routes/channelRoutes"));

// Socket.IO
const onlineUsersLocal = new Map();

io.on("connection", (socket) => {
  socket.on("join", async (userId) => {
    if (getIsRedisConnected()) {
      await redisClient.hSet("onlineUsers", userId, socket.id);
      const online = await redisClient.hKeys("onlineUsers");
      io.emit("getOnlineUsers", online);
    } else {
      onlineUsersLocal.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsersLocal.keys()));
    }
    socket.join(userId);
  });

  socket.on("send_message", async (data) => {
    let receiverSocketId;
    if (getIsRedisConnected()) {
      receiverSocketId = await redisClient.hGet("onlineUsers", data.receiverId);
    } else {
      receiverSocketId = onlineUsersLocal.get(data.receiverId);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", data);
    }
  });

  socket.on("channel_message", async (data) => {
    // In a real app, users would join a room for each channel
    // For now, we broadcast to all members online
    io.emit("receive_channel_message", data);
  });

  socket.on("typing", async (data) => {
    let receiverSocketId;
    if (getIsRedisConnected()) {
      receiverSocketId = await redisClient.hGet("onlineUsers", data.receiverId);
    } else {
      receiverSocketId = onlineUsersLocal.get(data.receiverId);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("display_typing", data);
    }
  });

  socket.on("stop_typing", async (data) => {
    let receiverSocketId;
    if (getIsRedisConnected()) {
      receiverSocketId = await redisClient.hGet("onlineUsers", data.receiverId);
    } else {
      receiverSocketId = onlineUsersLocal.get(data.receiverId);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("hide_typing", data);
    }
  });

  socket.on("mark_seen", async (data) => {
    let senderSocketId;
    if (getIsRedisConnected()) {
      senderSocketId = await redisClient.hGet("onlineUsers", data.senderId);
    } else {
      senderSocketId = onlineUsersLocal.get(data.senderId);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_seen", data);
    }
  });

  // Call Signaling
  socket.on("call_user", async (data) => {
    let receiverSocketId;
    if (getIsRedisConnected()) {
      receiverSocketId = await redisClient.hGet("onlineUsers", data.userToCall);
    } else {
      receiverSocketId = onlineUsersLocal.get(data.userToCall);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming_call", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
        avatar: data.avatar
      });
    }
  });

  socket.on("answer_call", async (data) => {
    let callerSocketId;
    if (getIsRedisConnected()) {
      callerSocketId = await redisClient.hGet("onlineUsers", data.to);
    } else {
      callerSocketId = onlineUsersLocal.get(data.to);
    }
    if (callerSocketId) {
      io.to(callerSocketId).emit("call_accepted", data.signal);
    }
  });

  socket.on("end_call", async (data) => {
    let otherSocketId;
    if (getIsRedisConnected()) {
      otherSocketId = await redisClient.hGet("onlineUsers", data.to);
    } else {
      otherSocketId = onlineUsersLocal.get(data.to);
    }
    if (otherSocketId) {
      io.to(otherSocketId).emit("call_ended");
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (getIsRedisConnected()) {
        const allUsers = await redisClient.hGetAll("onlineUsers");
        const userId = Object.keys(allUsers).find(key => allUsers[key] === socket.id);
        if (userId) {
          await redisClient.hDel("onlineUsers", userId);
          const online = await redisClient.hKeys("onlineUsers");
          io.emit("getOnlineUsers", online);
        }
      } else {
        onlineUsersLocal.forEach((value, key) => {
          if (value === socket.id) {
            onlineUsersLocal.delete(key);
          }
        });
        io.emit("getOnlineUsers", Array.from(onlineUsersLocal.keys()));
      }
    } catch (err) {
      console.error("Error on disconnect:", err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
