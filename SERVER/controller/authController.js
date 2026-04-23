const User = require("../model/user");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const Activity = require("../model/activity");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPasswordOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number (must be 10 digits)",
      });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpire = Date.now() + 5 * 60 * 1000;

    const user = new User({
      name,
      email,
      password: hashedPass,
      phone,
      otp: hashedOtp,
      otpExpire,
      isVerified: false,
      roles: ["user"],
    });

    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `Your OTP is <b>${otp}</b>`,
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }
    await Activity.create({
      type: "user",
      message: `${user.name} joined`,
      userId: user._id,
    });
    res.status(200).json({
      message: "Signup successful. Verify OTP.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new AppError("Invalid credentials", 400));

    if (!user.isVerified) {
      return next(new AppError("Please verify your email", 400));
    }

    if (user.isBlocked) {
      return next(new AppError("Account blocked by admin", 403));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return next(new AppError("Invalid credentials", 400));
    }

    const token = jwt.sign(
      {
        userId: user._id,
        roles: user.roles,
      },
      process.env.JWT_KEY,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isBlocked: user.isBlocked,
        image: user.image || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = forgotPasswordOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpire = Date.now() + 60 * 1000;

    user.otp = hashedOtp;
    user.otpExpire = otpExpire;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}. Valid for 1 minute.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = forgotPasswordOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpire = Date.now() + 60 * 1000;

    user.otp = hashedOtp;
    user.otpExpire = otpExpire;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Resend",
      text: `Your OTP is ${otp}. Valid for 1 minute.`,
    });

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
