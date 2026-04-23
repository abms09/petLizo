const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const auth = require("../middleware/authMiddleware");
const {
  requestPet,
  getUserRequests,
  submitFeedback,
  updateUserProfile,
  getUserProfile,
} = require("../controller/userController");

router.post("/request-pet/:petId", auth, requestPet);
router.get("/requests", auth, getUserRequests);
router.post("/feedback", auth, submitFeedback);
router.get("/profile", auth, getUserProfile);
router.put("/updateprofile", auth, upload.single("image"), updateUserProfile);

module.exports = router;
