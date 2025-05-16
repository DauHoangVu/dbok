const express = require("express");
const router = express.Router();
const {
    getCinemas,
    getCinema,
    createCinema,
    updateCinema,
    deleteCinema,
    getCinemasByCity,
} = require("../controllers/cinemaController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getCinemas);
router.get("/city/:city", getCinemasByCity);
router.get("/:id", getCinema);

// Admin routes - protected with authentication and authorization
router.post("/", protect, authorize("admin"), createCinema);
router.put("/:id", protect, authorize("admin"), updateCinema);
router.delete("/:id", protect, authorize("admin"), deleteCinema);

module.exports = router;