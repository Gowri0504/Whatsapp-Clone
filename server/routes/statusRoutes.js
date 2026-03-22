const express = require("express");
const router = express.Router();
const { uploadStatus, getStatuses } = require("../controllers/statusController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, uploadStatus);
router.get("/", protect, getStatuses);

module.exports = router;
