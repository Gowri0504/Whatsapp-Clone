const Channel = require("../models/Channel");

const createChannel = async (req, res) => {
  const { name, description, avatar } = req.body;
  try {
    const channel = await Channel.create({
      name,
      description,
      avatar,
      admin: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find();
    res.status(200).json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    
    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }
    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChannelMessages = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate("messages.senderId", "username avatar");
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.status(200).json(channel.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendChannelMessage = async (req, res) => {
  const { message, type } = req.body;
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    
    if (!channel.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Must be a member to send messages" });
    }

    const newMessage = {
      senderId: req.user._id,
      message,
      type: type || "text",
      createdAt: new Date(),
    };

    channel.messages.push(newMessage);
    await channel.save();
    
    // For simplicity, returning the message with the populated sender
    const savedMessage = channel.messages[channel.messages.length - 1];
    res.status(201).json({
      ...savedMessage.toObject(),
      senderId: {
        _id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createChannel, getChannels, joinChannel, getChannelMessages, sendChannelMessage };
