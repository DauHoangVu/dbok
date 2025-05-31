const express = require("express");
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    updatePaymentStatus,
    checkSeatAvailability,
    getBookingStats,
    createPaymentIntent,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");
router.get("/stats", getBookingStats);

// Protected routes
router.post("/create-payment-intent", createPaymentIntent);
router.post("/", createBooking);
router.get("/", getUserBookings);
router.get("/:id", getBooking);
router.put("/:id", updateBookingStatus);
router.put("/:id/payment", updatePaymentStatus);

// Public route for checking seat availability
router.post("/check-seats", checkSeatAvailability);

module.exports = router;