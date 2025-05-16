const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getMovieReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    likeReview
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/", getMovieReviews);
router.get("/:id", getReview);

// Protected routes (require authentication)
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.put("/:id/like", protect, likeReview);

module.exports = router;