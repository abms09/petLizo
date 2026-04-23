const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const upload = require("../middleware/upload");

const {
  addPet,
  getSellerDashboard,
  getMyPets,
  editPet,
  deletePet,
  getSoldPets,
  getFeedback,
  getSellerProfile,
  updateProfile,
  becomeSeller,
  getRequests,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  markAsSold,
} = require("../controller/sellerController");

router.post(
  "/addpet",
  (req, res, next) => {
    console.log("ROUTE HIT");
    next();
  },
  authMiddleware,
  authorizeRoles("seller"),
  upload.array("images", 4),
  addPet,
);

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("seller"),
  getSellerDashboard,
);

router.get("/mypets", authMiddleware, authorizeRoles("seller"), getMyPets);

router.put(
  "/editpet/:id",
  authMiddleware,
  authorizeRoles("seller"),
  upload.array("images", 4),
  editPet,
);

router.delete(
  "/deletepet/:id",
  authMiddleware,
  authorizeRoles("seller"),
  deletePet,
);

router.get("/soldpets", authMiddleware, authorizeRoles("seller"), getSoldPets);
router.get("/feedbacks", authMiddleware, authorizeRoles("seller"), getFeedback);

router.get("/profile", authMiddleware, getSellerProfile);

router.put(
  "/updateprofile",
  authMiddleware,
  upload.single("image"),
  updateProfile,
);
router.post("/become-seller", authMiddleware, becomeSeller);
router.get("/requests", authMiddleware, authorizeRoles("seller"), getRequests);
router.put(
  "/request/:id",
  authMiddleware,
  authorizeRoles("seller"),
  updateRequestStatus,
);
router.put(
  "/approve/:id",
  authMiddleware,
  authorizeRoles("seller"),
  approveRequest,
);

router.delete(
  "/reject/:id",
  authMiddleware,
  authorizeRoles("seller"),
  rejectRequest,
);

module.exports = router;
