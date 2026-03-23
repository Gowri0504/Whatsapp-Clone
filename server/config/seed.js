const User = require("../models/User");
const Channel = require("../models/Channel");
const Status = require("../models/Status");

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found. Seeding demo data...");
      
      const demoUsers = [
        {
          username: "Alice",
          email: "alice@example.com",
          password: "password123",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
        },
        {
          username: "Bob",
          email: "bob@example.com",
          password: "password123",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
        }
      ];

      const createdUsers = [];
      for (const user of demoUsers) {
        const newUser = await User.create(user);
        createdUsers.push(newUser);
      }
      
      console.log("Demo users created successfully!");

      // Seed Channels
      const channelCount = await Channel.countDocuments();
      if (channelCount === 0) {
        const demoChannels = [
          { name: "Tech News", description: "Latest in tech and gadgets", admin: createdUsers[0]._id },
          { name: "Sports Central", description: "All things sports", admin: createdUsers[0]._id },
          { name: "Movies & Series", description: "What to watch tonight", admin: createdUsers[1]._id }
        ];
        await Channel.insertMany(demoChannels);
        console.log("Demo channels created successfully!");
      }

      // Seed a Status for Alice
      await Status.create({
        userId: createdUsers[0]._id,
        mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        caption: "Beautiful view!"
      });
      console.log("Demo status created!");
    }
  } catch (error) {
    console.error("Error seeding demo data:", error.message);
  }
};

module.exports = seedDemoData;
