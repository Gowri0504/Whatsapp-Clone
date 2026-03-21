const Chat = require("../models/Chat");

const getChats = async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChats };
