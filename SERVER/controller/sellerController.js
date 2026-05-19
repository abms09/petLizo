const Pet = require("../model/pet");
const User = require("../model/user");
const Feedback = require("../model/feedback");
const Seller = require("../model/seller");
const Request = require("../model/request");
const Notification = require("../model/notification");
const Activity = require("../model/activity");
const sendEmail = require("../utils/sendEmail");
const Payment = require("../model/payment");

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
    let { name, breed, age, price, category, description, gender, location } =
      req.body;

    name = name?.trim();
    breed = breed?.trim();
    description = description?.trim();
    location = location?.trim();
    category = category?.trim();
    gender = gender?.trim();

    const imageFiles = req.files?.map((file) => file.filename) || [];

    if (!name) {
      return res.status(400).json({
        message: "Pet name is required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: "Pet name must be at least 2 characters",
      });
    }

    if (!breed) {
      return res.status(400).json({
        message: "Breed is required",
      });
    }

    if (age === undefined || age === null || age === "") {
      return res.status(400).json({
        message: "Age is required",
      });
    }

    if (isNaN(age) || Number(age) < 0) {
      return res.status(400).json({
        message: "Invalid age",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        message: "Price is required",
      });
    }

    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    const validCategories = ["dog", "cat", "bird", "other"];

    if (!category || !validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    const validGender = ["male", "female"];

    if (gender && !validGender.includes(gender.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid gender",
      });
    }

    if (!location) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        message: "Description should be at least 10 characters",
      });
    }

    if (imageFiles.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
      });
    }

    const pet = await Pet.create({
      name,
      breed,
      age: Number(age),
      price: Number(price),
      category: category.toLowerCase(),
      description,
      gender: gender?.toLowerCase() || "male",
      location,
      image: imageFiles,
      seller: req.user._id,
    });

    await Activity.create({
      type: "pet",
      message: `${pet.name} listed by ${req.user.name}`,
      userId: req.user.id,
      userName: req.user.name,
    });

    res.status(201).json({
      message: "Pet added successfully",
      pet,
    });
  } catch (err) {
    console.log("ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getSellerDashboard = async (req, res) => {
  try {
    const totalPets = await Pet.countDocuments({
      seller: req.user._id,
    });

    const soldPets = await Pet.countDocuments({
      seller: req.user._id,
      status: "sold",
    });

    const activePets = totalPets - soldPets;

    const payments = await Payment.find({
      seller: req.user._id,
    });

    console.log("PAYMENTSDASH:", payments);

    const totalEarnings = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.sellerAmount || 0), 0);

    const pendingPayments = payments
      .filter((p) => p.status === "created")
      .reduce((sum, p) => sum + (p.sellerAmount || 0), 0);

    const completedPayments = payments.filter(
      (p) => p.status === "paid",
    ).length;

    res.json({
      totalPets,
      soldPets,
      activePets,

      totalEarnings,
      pendingPayments,
      completedPayments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getMyPets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 6;

    const search = req.query.search || "";

    const category = req.query.category || "all";

    const status = req.query.status || "all";

    const skip = (page - 1) * limit;

    const filter = {
      seller: req.user._id,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category !== "all") {
      filter.category = category;
    }

    if (status !== "all") {
      filter.status = status;
    }

    const totalPets = await Pet.countDocuments(filter);

    const pets = await Pet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      pets,
      currentPage: page,
      totalPages: Math.ceil(totalPets / limit),
      totalPets,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message || "Failed to fetch pets",
    });
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
    console.log("ERROR:", error);
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

const mongoose = require("mongoose");

exports.getSoldPets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const search = req.query.search?.trim();

    const skip = (page - 1) * limit;

    const query = {
      seller: req.user._id,
      status: "sold",
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const total = await Pet.countDocuments(query);

    const pets = await Pet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      pets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPets: total,
    });
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

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 6;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const status = req.query.status || "all";

    const query = {
      seller: sellerId,
    };

    if (status !== "all") {
      query.status = status;
    }

    let requests = await Request.find(query)
      .populate("pet")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    requests = requests.filter((r) => r.pet && r.buyer);

    if (search) {
      requests = requests.filter(
        (r) =>
          r.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.buyer?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const totalRequests = requests.length;

    const totalPages = Math.ceil(totalRequests / limit);

    const paginatedRequests = requests.slice(skip, skip + limit);

    res.json({
      requests: paginatedRequests,
      currentPage: page,
      totalPages,
      totalRequests,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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
      .populate({
        path: "pet",
        populate: {
          path: "seller",
          model: "User",
        },
      });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        message: "Request already approved",
      });
    }

    if (request.pet?.status === "sold" || request.pet?.status === "booked") {
      return res.status(400).json({
        message: "Pet already booked or sold",
      });
    }

    const price = Number(request.pet?.price || 0);

    const advance = Math.round(price * 0.15);
    const remaining = price - advance;

    request.status = "approved";

    request.paymentStatus = "none";

    request.advanceAmount = advance;
    request.remainingAmount = remaining;

    await request.save();

    await Pet.findByIdAndUpdate(request.pet._id, {
      status: "pending",
    });

    const otherRequests = await Request.find({
      pet: request.pet._id,
      _id: { $ne: request._id },
      status: "pending",
    }).populate("buyer");

    await Request.updateMany(
      {
        pet: request.pet._id,
        _id: { $ne: request._id },
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      },
    );

    for (const other of otherRequests) {
      try {
        await Notification.create({
          user: other.buyer._id,
          message: `Your request for ${request.pet.name} was rejected ❌`,
          status: "rejected",
          isRead: false,
        });

        if (other.buyer?.email) {
          await sendEmail(
            other.buyer.email,
            "Pet Request Rejected ❌",
            `
            <h2>Request Rejected</h2>
            <p>Your request for <b>${request.pet.name}</b> was rejected.</p>
            <p>Thank you for using PetMart 🐾</p>
            `,
          );
        }
      } catch (err) {
        console.log("Rejected user notification error:", err.message);
      }
    }

    try {
      await Notification.create({
        user: request.buyer._id,
        message: `Your request for ${request.pet.name} was approved 🎉`,
        status: "accepted",
        isRead: false,
      });

      if (request.buyer?.email) {
        await sendEmail(
          request.buyer.email,
          "Pet Request Approved 🎉",
          `
          <h2>Request Approved 🎉</h2>

          <p>Your request for <b>${request.pet.name}</b> was approved.</p>

          <h3>Payment Details</h3>
          <p>Total Price: ₹${price}</p>
          <p>Advance (15%): ₹${advance}</p>
          <p>Remaining: ₹${remaining}</p>

          <p>Please complete advance payment to confirm booking.</p>
          `,
        );
      }
    } catch (err) {
      console.log("Approved user notification error:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Request approved successfully",
      request,
    });
  } catch (err) {
    console.error("APPROVE REQUEST ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("buyer")
      .populate("pet");

    if (!request) {
      return res.status(404).json({
        message: "Not found",
      });
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

    await Notification.create({
      user: request.buyer._id,
      message: `Your request for ${request.pet.name} was rejected 😔`,
      status: "rejected",
      isRead: false,
    });

    await sendEmail(
      request.buyer.email,
      "Pet Request Rejected",
      `
      <h2>Request Rejected</h2>

      <p>
        Sorry, your request for
        <b>${request.pet.name}</b>
        was rejected by the seller.
      </p>

      <p>
        You can still explore other pets on PetMart 🐾
      </p>
      `,
    );

    res.json({
      message: "Rejected",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
exports.getSellerPayments = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const payments = await Payment.find({
      seller: sellerId,
    })
      .populate("buyer", "name email")
      .populate("pet", "name image price status")
      .sort({ createdAt: -1 });

    let totalEarnings = 0;
    let pending = 0;
    let released = 0;

    const formatted = payments.map((p) => {
      let sellerEarned = 0;

      if (p.pet?.status === "sold" || p.paymentType === "full") {
        sellerEarned = (p.sellerAmount || 0) + (p.remainingAmount || 0);
      } else if (p.status === "paid") {
        sellerEarned = p.sellerAmount || 0;
      }

      totalEarnings += sellerEarned;

      if (p.status === "paid") {
        released += sellerEarned;
      } else {
        pending += sellerEarned;
      }

      return {
        _id: p._id,

        pet: p.pet,

        buyer: p.buyer,

        totalAmount: p.totalAmount,

        advanceAmount: p.advanceAmount,

        remainingAmount: p.remainingAmount,

        sellerAmount: sellerEarned,

        status: p.status,

        saleStatus: p.pet?.status === "sold" ? "sold" : "partial",
      };
    });

    res.json({
      payments: formatted,

      summary: {
        totalEarnings,
        pending,
        released,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
