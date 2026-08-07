const express = require("express");
const { createPurchase } = require("../controllers/purchaseController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/:showtimeId", protect, createPurchase);

module.exports = router;
