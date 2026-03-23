const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.log("Redis reconnection failed after 3 attempts. Continuing without Redis.");
        return false; // Stop reconnecting
      }
      return 1000; // Try again in 1s
    }
  }
});

let isRedisConnected = false;

client.on("error", (err) => {
  // Only log if it was previously connected or on first fail
  if (isRedisConnected) {
    console.log("Redis Client Error", err.message);
    isRedisConnected = false;
  }
});

const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log("Redis Connected Successfully");
      isRedisConnected = true;
    }
    return true;
  } catch (err) {
    console.error("Redis Connection Failed:", err.message);
    isRedisConnected = false;
    return false;
  }
};

module.exports = { client, connectRedis, getIsRedisConnected: () => isRedisConnected };
