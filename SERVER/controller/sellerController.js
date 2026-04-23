const Pet = require("../model/pet");
const User = require("../model/user");
const Feedback = require("../model/feedback");
const Seller = require("../model/seller");
const Request = require("../model/request");
const Notification = require("../model/notification");
const Activity = require("../model/activity");

exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id }).populate(
      "user",
      "name email",
    );

    if (!seller) {
      return res.status(404).json({ message: "No seller profile" });
    }

    res.json({
      name: seller.user?.name,
      email: seller.user?.email,
      phone: seller.phone,
      image: seller.user?.image,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const seller = await Seller.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone } = req.body;

    if (name) user.name = name;

    if (req.file) {
      user.image = req.file.path;
    }

    await user.save();

    if (seller && phone) {
      seller.phone = phone;
      await seller.save();
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.addPet = async (req, res) => {
  try {
    const { name, breed, age, price, category, description, gender, location } =
      req.body;

    const imageFiles = req.files?.map((file) => file.filename) || [];

    const pet = await Pet.create({
      name,
      breed,
      age: Number(age),
      price: Number(price),
      category,
      description: description || "",
      gender: gender || "male",
      location: location || "",
      image: imageFiles,
      seller: req.user._id,
    });
    await Activity.create({
      type: "pet",
      message: `${pet.name} listed by ${req.user.name}`,
      userId: req.user.id,
      userName: req.user.name,
    });
    res.status(201).json(pet);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalPets = await Pet.countDocuments({ seller: sellerId });

    const soldPets = await Pet.countDocuments({
      seller: sellerId,
      status: "sold",
    });

    res.json({ totalPets, soldPets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editPet = async (req, res) => {
  try {
    const petId = req.params.id;
    const userId = req.user._id;

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedData = {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      gender: req.body.gender,
    };

    if (req.files && req.files.length > 0) {
      updatedData.image = req.files.map((file) => file.filename);
    }

    const updatedPet = await Pet.findByIdAndUpdate(petId, updatedData, {
      new: true,
    });

    res.json({
      message: "Pet updated successfully",
      pet: updatedPet,
    });
  } catch (error) {
    console.log("ERROR 💥:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await pet.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSoldPets = async (req, res) => {
  try {
    const pets = await Pet.find({
      seller: req.user._id,
      status: "sold",
    });

    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email image")
      .populate("pet", "name");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.becomeSeller = async (req, res) => {
  try {
    const { shopName, phone, address } = req.body;

    if (!shopName || !phone || !address) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingSeller = await Seller.findOne({ user: user._id });

    if (existingSeller) {
      return res.status(400).json({
        message: "Already a seller",
        alreadySeller: true,
      });
    }

    if (!user.roles.includes("user")) {
      user.roles.push("user");
    }

    if (!user.roles.includes("seller")) {
      user.roles.push("seller");
    }

    await user.save();

    const seller = await Seller.create({
      user: user._id,
      shopName,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Seller account created successfully",
      seller,
      roles: user.roles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const requests = await Request.find({ seller: sellerId })
      .populate("pet")
      .populate("buyer", "name email");

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findById(id).populate("pet");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
      await Pet.findByIdAndUpdate(request.pet._id, {
        status: "sold",
      });

      await Request.updateMany(
        {
          pet: request.pet._id,
          _id: { $ne: request._id },
        },
        { status: "rejected" },
      );
    }

    res.json({ message: "Updated", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("buyer")
      .populate("pet");

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    request.status = "approved";
    await request.save();

    await Pet.findByIdAndUpdate(request.pet._id, { status: "pending" });

    await Notification.create({
      user: request.buyer._id,
      message: `Your request for ${request.pet.name} was approved 🎉`,
      status: "accepted",
      isRead: false,
    });

    res.json({ message: "Approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("buyer")
      .populate("pet");

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    request.status = "rejected";
    await request.save();

    if (request.pet?._id) {
      const pet = await Pet.findById(request.pet._id);

      if (pet) {
        pet.status = "available";
        await pet.save();
      }
    }

    if (request.buyer?._id) {
      await Notification.create({
        user: request.buyer._id,
        message: `Your request for ${request.pet?.name || "pet"} was rejected 😔`,
        status: "rejected",
        isRead: false,
      });
    }

    res.json({ message: "Rejected" });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
