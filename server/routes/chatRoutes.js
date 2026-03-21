const express = require("express");
const router = express.Router();
const { getChats } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:userId", protect, getChats);

module.exports = router;
