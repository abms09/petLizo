const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    breed: { type: String },

    age: { type: Number },

    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    category: {
      type: String,
      required: true,
      enum: ["dog", "cat", "bird", "other"],
    },

    description: { type: String, default: "" },

    price: { type: Number, required: true },

    image: [{ type: String }],

    location: { type: String },

    vaccinated: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },

    soldAt: {
      type: Date,
      default: null,
    },

    approved: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pet", petSchema);
