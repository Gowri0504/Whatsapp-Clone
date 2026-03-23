const Message = require("../models/Message");
const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  const { senderId, receiverId, message, type = 'text' } = req.body;
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  try {
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      type
    });

    // Update or create chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        lastMessage: newMessage._id,
      });
    } else {
      chat.lastMessage = newMessage._id;
      await chat.save();
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getMessages = async (req, res) => {
  const { receiverId, senderId } = req.params;
  if (!receiverId || !senderId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }
  const { page = 1, limit = 20 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Basic validation for file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid file type. Only images and audio are allowed.' });
  }

  // In a real app, you'd upload to a cloud service (S3, Cloudinary) and get a URL
  // For now, we'll just return the path from multer
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
};

module.exports = { sendMessage, getMessages, uploadFile };
