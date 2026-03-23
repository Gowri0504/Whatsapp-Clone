const User = require("../models/User");

const seedDemoUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found. Creating demo users...");
      
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

      for (const user of demoUsers) {
        await User.create(user);
      }
      
      console.log("Demo users created successfully!");
      console.log("Alice: alice@example.com / password123");
      console.log("Bob: bob@example.com / password123");
    }
  } catch (error) {
    console.error("Error seeding demo users:", error.message);
  }
};

module.exports = seedDemoUsers;
