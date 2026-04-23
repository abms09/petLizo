const Request = require("../model/request");
const Pet = require("../model/pet");
const User = require("../model/user");
const Feedback = require("../model/feedback");

exports.requestPet = async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findById(petId).populate("seller");
    const user = await User.findById(req.user._id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.status === "sold") {
      return res.status(400).json({ message: "Pet already sold" });
    }

    const existing = await Request.findOne({
      pet: petId,
      buyer: req.user._id,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Already requested" });
    }

    const request = await Request.create({
      pet: petId,
      buyer: req.user._id,
      seller: pet.seller,
    });

    pet.status = "pending";
    await pet.save();

    res.json({ message: "Request sent", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ buyer: req.user._id })
      .populate("pet")
      .populate("seller", "name email");

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { petId, sellerId, rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating required" });
    }

    const existing = await Feedback.findOne({
      user: req.user._id,
      pet: petId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already submitted feedback" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      seller: sellerId,
      pet: petId,
      rating,
      comment,
    });

    res.json({ message: "Feedback saved", feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      user.image = req.file.filename;
    }

    await user.save();
    res.json({
      message: "Profile updated",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
