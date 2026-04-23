const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getSellers,
  getUsers,
  getPets,
  getSoldPets,
  getFeedbacks,
  getComplaints,
  toggleBlockUser,
  approvePet,
  rejectPet,
  getCounts,
  markFeedbacksRead,
  markMsgAsRead,
  getRecentActivity,
} = require("../controller/adminController");

const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");


router.get("/dashboard", auth, isAdmin, getDashboardStats);
router.get("/sellers", auth, isAdmin, getSellers);
router.get("/users", auth, isAdmin, getUsers);
router.get("/pets", auth, isAdmin, getPets);
router.get("/sold-pets", auth, isAdmin, getSoldPets);
router.get("/feedbacks", auth, isAdmin, getFeedbacks);
router.get("/complaints", auth, isAdmin, getComplaints);
router.put("/users/:id/toggle-status", auth, isAdmin, toggleBlockUser);
router.put("/pets/:id/approve", auth, isAdmin, approvePet);
router.put("/pets/:id/reject", auth, isAdmin, rejectPet);
router.get("/counts", auth, isAdmin, getCounts);
router.put("/contacts/read-all", auth, isAdmin, markMsgAsRead);
router.put("/feedbacks/read-all", auth, isAdmin, markFeedbacksRead);
router.get("/recent-activity", auth, isAdmin, getRecentActivity);

module.exports = router;
