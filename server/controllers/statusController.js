const Status = require("../models/Status");

const uploadStatus = async (req, res) => {
  const { mediaUrl, caption, type } = req.body;
  try {
    const status = await Status.create({
      userId: req.user._id,
      mediaUrl,
      caption,
      type
    });
    const populatedStatus = await status.populate("userId", "username avatar");
    res.status(201).json(populatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatuses = async (req, res) => {
  try {
    // Get statuses from contacts/all users for demo
    const statuses = await Status.find().populate("userId", "username avatar").sort({ createdAt: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadStatus, getStatuses };
