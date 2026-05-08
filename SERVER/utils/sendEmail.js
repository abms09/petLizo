const transporter = require("../config/mailer");

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });

    console.log("Email sent");
  } catch (err) {
    console.log("EMAIL ERROR:", err.message);
  }
};

module.exports = sendEmail;