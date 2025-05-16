const express = require("express");
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    updatePaymentStatus,
    checkSeatAvailability,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes
router.post("/", protect, createBooking);
router.get("/", protect, getUserBookings);
router.get("/:id", protect, getBooking);
router.put("/:id", protect, updateBookingStatus);
router.put("/:id/payment", protect, authorize("admin"), updatePaymentStatus);

// Public route for checking seat availability
router.post("/check-seats", checkSeatAvailability);

module.exports = router;