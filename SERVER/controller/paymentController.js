const Razorpay = require("razorpay");
const crypto = require("crypto");

const Request = require("../model/request");
const Payment = require("../model/payment");
const Pet = require("../model/pet");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findById(requestId)
      .populate("pet")
      .populate("buyer")
      .populate("seller");

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "approved")
      return res.status(400).json({ message: "Request not approved" });

    if (request.pet?.status === "sold")
      return res.status(400).json({ message: "Pet already sold" });

    const totalAmount = Number(request.pet.price || 0);

    const advanceAmount = Math.round(totalAmount * 0.2);
    const remainingAmount = totalAmount - advanceAmount;

    const commission = Math.round(advanceAmount * 0.1);
    const sellerAmount = advanceAmount - commission;

    const order = await razorpay.orders.create({
      amount: advanceAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        requestId: request._id.toString(),
        petId: request.pet._id.toString(),
        buyerId: request.buyer._id.toString(),
        sellerId: request.seller._id.toString(),
      },
    });

    const payment = await Payment.create({
      request: request._id,
      pet: request.pet._id,
      buyer: request.buyer._id,
      seller: request.seller._id,

      totalAmount,
      advanceAmount,
      remainingAmount,

      commission,
      sellerAmount,

      status: "created",
      paymentType: "advance",

      razorpayOrderId: order.id,
    });

    res.json({
      success: true,
      order,
      payment,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      requestId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const request = await Request.findById(requestId).populate("pet");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.paymentStatus = "partial";
    request.advancePaidAt = new Date();
    await request.save();

    await Pet.findByIdAndUpdate(request.pet._id, {
      status: "booked",
    });

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        paymentType: "advance",
      },
    );

    res.json({
      success: true,
      message: "Advance payment successful",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
