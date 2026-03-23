const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: "24h" }, // Auto-delete after 24 hours
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", statusSchema);
