const express = require("express");
const router = express.Router();
const {
  signup,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  resentOtp,
  changePassword,
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resentOtp);
router.put("/change-password", authMiddleware, changePassword);
module.exports = router;
