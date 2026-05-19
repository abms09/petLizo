const User = require("../model/user");
const Pet = require("../model/pet");
const Feedback = require("../model/feedback");
const Complaint = require("../model/complaint");
const Contact = require("../model/contact");
const Activity = require("../model/activity");
const Seller = require("../model/seller");
const Payment = require("../model/payment");
const PDFDocument = require("pdfkit");
const Request = require("../model/request");

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

    const payments = await Payment.find({
      status: "paid",
    });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + (p.advanceAmount || 0),
      0,
    );

    const sellerRevenue = payments.reduce(
      (sum, p) => sum + (p.sellerAmount || 0),
      0,
    );

    const commissionRevenue = payments.reduce(
      (sum, p) => sum + (p.commission || 0),
      0,
    );

    const successfulPayments = payments.length;

    const pendingPayments = await Payment.countDocuments({
      status: "created",
    });

    const monthlyMap = {};

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);

      const month = date.toLocaleString("default", {
        month: "short",
      });

      if (!monthlyMap[month]) {
        monthlyMap[month] = 0;
      }

      monthlyMap[month] += payment.advanceAmount || 0;
    });

    const monthlyRevenue = Object.keys(monthlyMap).map((month) => ({
      month,
      amount: monthlyMap[month],
    }));

    res.json({
      totalUsers,
      totalSellers,
      totalPets,
      soldPets,
      totalFeedbacks,
      totalComplaints,

      totalRevenue,
      sellerRevenue,
      commissionRevenue,

      successfulPayments,
      pendingPayments,

      monthlyRevenue,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
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
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 8;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const status = req.query.status || "all";

    const approval = req.query.approval || "all";

    const query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status !== "all") {
      query.isSold = status === "sold";
    }

    if (approval !== "all") {
      if (approval === "pending") {
        query.$or = [{ approved: "pending" }, { approved: { $exists: false } }];
      } else {
        query.approved = approval;
      }
    }

    const totalPets = await Pet.countDocuments(query);

    const pets = await Pet.find(query)
      .populate("seller")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      pets,
      currentPage: page,
      totalPages: Math.ceil(totalPets / limit),
      totalPets,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSoldPets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 6;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const query = {
      status: "sold",
    };

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const totalPets = await Pet.countDocuments(query);

    const pets = await Pet.find(query)
      .populate("seller")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPets / limit);

    res.json({
      pets,
      currentPage: page,
      totalPages,
      totalPets,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
    await Contact.updateMany({ isRead: false }, { $set: { isRead: true } });

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

exports.generateReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const startDate = new Date(from);
    const endDate = new Date(to);

    endDate.setHours(23, 59, 59, 999);

    const totalUsers = await User.countDocuments({
      roles: { $in: ["user"] },
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalSellers = await User.countDocuments({
      roles: { $in: ["seller"] },
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalPets = await Pet.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const soldPets = await Pet.countDocuments({
      status: "sold",
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalFeedbacks = await Feedback.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalComplaints = await Complaint.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const payments = await Payment.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("buyer", "name")
      .populate("pet", "name")
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    const paidPayments = payments.filter((p) => p.status === "paid");

    const totalRevenue = paidPayments.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    );

    const sellerRevenue = paidPayments.reduce(
      (sum, p) => sum + (p.sellerAmount || 0),
      0,
    );

    const totalCommission = paidPayments.reduce(
      (sum, p) => sum + (p.commission || 0),
      0,
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(28).fillColor("#111827").text("Pet Adoption Report", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).fillColor("#6b7280").text(`From: ${from}    To: ${to}`, {
      align: "center",
    });

    doc.moveDown(2);

    doc.fontSize(20).fillColor("#111827").text("Summary");

    doc.moveDown();

    const summary = [
      ["Total Users", totalUsers],

      ["Total Sellers", totalSellers],

      ["Total Pets", totalPets],

      ["Sold Pets", soldPets],

      ["Total Feedbacks", totalFeedbacks],

      ["Total Complaints", totalComplaints],

      [
        "Total Revenue",
        "Rs. " + Number(totalRevenue || 0).toLocaleString("en-IN"),
      ],

      [
        "Seller Revenue",
        "Rs. " + Number(sellerRevenue || 0).toLocaleString("en-IN"),
      ],

      [
        "Admin Commission",
        "Rs. " + Number(totalCommission || 0).toLocaleString("en-IN"),
      ],
    ];

    summary.forEach(([label, value]) => {
      const currentY = doc.y;

      doc
        .roundedRect(40, currentY, 515, 24, 5)
        .fillAndStroke("#f3f4f6", "#e5e7eb");

      doc
        .fillColor("#111827")
        .fontSize(12)
        .font("Helvetica")
        .text(label, 50, currentY + 6);

      doc
        .fillColor("#2563eb")
        .font("Helvetica-Bold")
        .text(String(value), 400, currentY + 6, {
          width: 140,
          align: "right",
        });

      doc.moveDown(1.5);
    });

    doc.moveDown(2);

    doc
      .fontSize(20)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text("Payment Details");

    doc.moveDown(1.5);

    const tableTop = doc.y;

    const col1 = 40;
    const col2 = 90;
    const col3 = 170;
    const col4 = 250;
    const col5 = 340;
    const col6 = 440;
    const col7 = 520;

    const rowHeight = 28;

    doc
      .fillColor("#2563eb")
      .roundedRect(35, tableTop - 5, 540, 28, 4)
      .fill();

    doc.fillColor("white").font("Helvetica-Bold").fontSize(10);

    doc.text("Payment", col1, tableTop + 2);

    doc.text("Pet", col2, tableTop + 2);

    doc.text("Buyer", col3, tableTop + 2);

    doc.text("Seller", col4, tableTop + 2);

    doc.text("Amount", col5, tableTop + 2);

    doc.text("Commission", col6, tableTop + 2);

    doc.text("Status", col7, tableTop + 2);

    let y = tableTop + 35;

    payments.forEach((p, index) => {
      if (y > 720) {
        doc.addPage();

        y = 60;
      }

      if (index % 2 === 0) {
        doc
          .fillColor("#f3f4f6")
          .rect(35, y - 5, 540, 24)
          .fill();
      }

      doc.fillColor("#111827").font("Helvetica").fontSize(9);

      doc.text(String(p._id).slice(-6), col1, y);

      doc.text(p.pet?.name || "-", col2, y, {
        width: 70,
      });

      doc.text(p.buyer?.name || "-", col3, y, {
        width: 70,
      });

      doc.text(p.seller?.name || "-", col4, y, {
        width: 70,
      });

      doc.text(
        "Rs. " + Number(p.totalAmount || 0).toLocaleString("en-IN"),
        col5,
        y,
      );

      doc.text(
        "Rs. " + Number(p.commission || 0).toLocaleString("en-IN"),
        col6,
        y,
      );

      doc
        .fillColor(p.status === "paid" ? "green" : "#dc2626")
        .text(p.status, col7, y);

      y += rowHeight;
    });

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .font("Helvetica")
      .text(`Generated on ${new Date().toLocaleString()}`, 40, 780, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: err.message,
    });
  }
};
