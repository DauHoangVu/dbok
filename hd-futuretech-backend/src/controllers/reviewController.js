const Review = require("../models/Review");
const Movie = require("../models/Movie");

// @desc    Get all reviews for a movie
// @route   GET /api/movies/:movieId/reviews
// @access  Public
exports.getMovieReviews = async(req, res, next) => {
    try {
        const { movieId } = req.params;

        // Verify that the movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        const reviews = await Review.find({ movie: movieId })
            .populate("user", "name")
            .sort("-createdAt");

        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async(req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate("user", "name")
            .populate("movie", "title posterUrl");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json(review);
    } catch (err) {
        next(err);
    }
};

// @desc    Create a review
// @route   POST /api/movies/:movieId/reviews
// @access  Private
exports.createReview = async(req, res, next) => {
    try {
        const { movieId } = req.params;
        const { rating, comment } = req.body;

        // Verify that the movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        // Check if user already reviewed this movie
        const existingReview = await Review.findOne({
            movie: movieId,
            user: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this movie"
            });
        }

        // Create review
        const review = await Review.create({
            movie: movieId,
            user: req.user.id,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id)
            .populate("user", "name");

        res.status(201).json({
            success: true,
            data: populatedReview
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async(req, res, next) => {
    try {
        const { rating, comment } = req.body;

        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Make sure review belongs to user
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this review"
            });
        }

        // Update review
        review = await Review.findByIdAndUpdate(
            req.params.id, { rating, comment }, { new: true, runValidators: true }
        ).populate("user", "name");

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async(req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Make sure review belongs to user or user is admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this review"
            });
        }

        await review.remove();

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Like a review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async(req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if user already liked this review
        const alreadyLiked = review.likedBy.includes(req.user.id);

        if (alreadyLiked) {
            // Remove like
            review.likes -= 1;
            review.likedBy = review.likedBy.filter(id => id.toString() !== req.user.id);
        } else {
            // Add like
            review.likes += 1;
            review.likedBy.push(req.user.id);
        }

        await review.save();

        res.status(200).json({
            success: true,
            data: {
                likes: review.likes,
                alreadyLiked: !alreadyLiked
            }
        });
    } catch (err) {
        next(err);
    }
};