const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
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

    totalAmount: { type: Number, required: true },

    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    commission: { type: Number, default: 0 },
    sellerAmount: { type: Number, default: 0 },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    paymentType: {
      type: String,
      enum: ["advance", "full"],
      default: "advance",
    },

    saleStatus: {
      type: String,
      enum: ["pending", "partial", "sold"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
