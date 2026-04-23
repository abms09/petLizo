// models/contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
