const express = require("express");
const router = express.Router();
const { registerUser, authUser, getUsers, updateUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/", protect, getUsers);
router.put("/profile", protect, updateUser);

module.exports = router;
