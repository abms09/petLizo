const express = require("express");
const router = express.Router();

const {
  acceptRequest,
  rejectRequest,
} = require("../controller/requestController");

router.put("/accept/:id", acceptRequest);
router.put("/reject/:id", rejectRequest);

module.exports = router;
