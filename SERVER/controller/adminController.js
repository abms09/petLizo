const User = require("../model/user");
const Pet = require("../model/pet");
const Feedback = require("../model/feedback");
const Complaint = require("../model/complaint");
const Contact = require("../model/contact");
const Activity = require("../model/activity");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      roles: { $in: ["user"] },
    });

    const totalSellers = await User.countDocuments({
      roles: { $in: ["seller"] },
    });

    const totalPets = await Pet.countDocuments();

    const soldPets = await Pet.countDocuments({
      status: "sold",
    });

    const totalFeedbacks = await Feedback.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    res.json({
      totalUsers,
      totalSellers,
      totalPets,
      soldPets,
      totalFeedbacks,
      totalComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      roles: { $in: ["user"] },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const Seller = require("../model/seller");

exports.getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate(
      "user",
      "name email isBlocked",
    );

    res.json(sellers);
  } catch (err) {
    console.log("ERROR IN GET SELLERS:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate("seller");
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSoldPets = async (req, res) => {
  try {
    const pets = await Pet.find({
      status: "sold",
    }).populate("seller");

    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name")
      .populate("seller", "name");
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("user");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: "User status updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approvePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    pet.approved = "approved";
    await pet.save();

    res.json({ message: "Pet approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    pet.approved = "rejected";
    await pet.save();

    res.json({ message: "Pet rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCounts = async (req, res) => {
  try {
    const pets = await Pet.countDocuments({
      approved: "pending",
    });

    const feedbacks = await Feedback.countDocuments({
      isRead: false,
    });

    const messages = await Contact.countDocuments({
      isRead: false,
    });

    res.json({ pets, feedbacks, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markMsgAsRead = async (req, res) => {
  try {
    await Contact.updateMany(
      { isRead: false },
      { $set: { isRead: true } },
    );

    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markFeedbacksRead = async (req, res) => {
  try {
    await Feedback.updateMany({ isRead: false }, { $set: { isRead: true } });

    res.json({ message: "Feedbacks marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activity = await Activity.find({}).sort({ createdAt: -1 }).limit(10);

    return res.status(200).json(activity);
  } catch (err) {
    console.error("Activity error:", err);
    return res.status(500).json({
      message: "Error fetching activity",
      error: err.message,
    });
  }
};
