const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, uploadFile } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.post("/", protect, sendMessage);
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/:receiverId/:senderId", protect, getMessages);

module.exports = router;
