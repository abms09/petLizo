const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
} = require("../controller/notificationController");
const auth = require("../middleware/authMiddleware");

router.get("/my", auth, getMyNotifications);
router.put("/read", auth, markAsRead);

module.exports = router;
