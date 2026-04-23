const Notification = require("../model/notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } },
    );

    console.log("Updated:", result);

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("READ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
