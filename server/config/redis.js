const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  try {
    // Check if client is already connected or connecting
    if (!client.isOpen) {
      await client.connect();
      console.log("Redis Connected Successfully");
    }
  } catch (err) {
    console.error("Redis Connection Failed:", err.message);
    // In production, you might want to handle this more gracefully
  }
};

module.exports = { client, connectRedis };
