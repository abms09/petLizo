const express = require("express");
const router = express.Router();

const { sendMessage, getMessages } = require("../controller/contactController");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorizeRoles");

router.post("/", sendMessage);

router.get("/", auth, authorize("admin"), getMessages);

module.exports = router;
