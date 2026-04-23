const jwt = require("jsonwebtoken");
const User = require("../model/user");

module.exports = async (req, res, next) => {
  try {
    console.log("AUTH HIT");
    console.log("HEADER:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "You are blocked by admin",
      });
    }

    req.user = user;

    console.log("USER ATTACHED:", {
      _id: user._id,
      roles: user.roles,
      isBlocked: user.isBlocked,
    });

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
