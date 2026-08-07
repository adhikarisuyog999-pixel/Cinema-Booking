const express = require("express");
const movieController = require("../controllers/movieController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", movieController.getAll);
router.get("/:id", movieController.getMovie);
router.post("/", protect, movieController.createMovie);
router.put("/:id", protect, movieController.updateMovie);
router.delete("/:id", protect, movieController.deleteMovie);

module.exports = router;
