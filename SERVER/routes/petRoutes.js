const express = require("express");
const router = express.Router();

const {
  createPet,
  getAllPets,
  getSinglePet,
  getMyPets,
  updatePet,
  deletePet,
  updatePetStatus,
  getSoldPets,
  markAsSold,
} = require("../controller/petController");

const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorizeRoles");

router.get("/", getAllPets);

router.get("/sold", auth, getSoldPets);

router.get("/my/pets", auth, authorize("seller"), getMyPets);
router.post("/", auth, authorize("seller", "admin"), createPet);

router.put("/sold/:id", auth, authorize("seller"), markAsSold);

router.put("/:id", auth, authorize("seller", "admin"), updatePet);
router.delete("/:id", auth, authorize("seller", "admin"), deletePet);

router.put("/adopt/:id", auth, updatePetStatus);

router.get("/:id", getSinglePet);

module.exports = router;
