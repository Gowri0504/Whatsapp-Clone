const express = require("express");
const router = express.Router();
const { createChannel, getChannels, joinChannel, getChannelMessages, sendChannelMessage } = require("../controllers/channelController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createChannel);
router.get("/", protect, getChannels);
router.post("/:id/join", protect, joinChannel);
router.get("/:id/messages", protect, getChannelMessages);
router.post("/:id/messages", protect, sendChannelMessage);

module.exports = router;
