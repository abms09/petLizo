const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["none", "partial", "completed"],
      default: "none",
    },
    paymentId: {
      type: String,
    },

    advancePaidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Request", requestSchema);
