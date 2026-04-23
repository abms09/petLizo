const Request = require("../model/request");
const Notification = require("../model/notification");

exports.acceptRequest = async (req, res) => {
  try {
    console.log("=== ACCEPT API HIT ===");

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    await request.save();

    console.log("Request:", request);
    console.log("Buyer:", request.buyer);

    const notification = await Notification.create({
      user: request.buyer,
      message: "Your request was accepted 🎉",
      status: "accepted",
      isRead: false,
    });

    console.log("✅ Notification SAVED:", notification);

    return res.json({
      message: "Request accepted",
      request,
      notification,
    });
  } catch (err) {
    console.error("❌ ACCEPT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    const notification = await Notification.create({
      user: request.buyer,
      message: "Your request was rejected 😔",
      status: "rejected",
      isRead: false,
    });

    return res.json({
      message: "Request rejected",
      request,
      notification,
    });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
