const Contact = require("../model/contact");
const Activity = require("../model/activity");

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newMsg = await Contact.create({
      name,
      email,
      message,
    });
    await Activity.create({
      type: "contact",
      message: `New Message arrived`,
    });
    res.status(201).json({ message: "Message sent", data: newMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
