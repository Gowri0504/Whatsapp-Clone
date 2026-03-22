const Status = require("../models/Status");

const uploadStatus = async (req, res) => {
  const { imageUrl, caption } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    const status = await Status.create({
      userId: req.user._id,
      imageUrl,
      caption,
    });
    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadStatus, getStatuses };
