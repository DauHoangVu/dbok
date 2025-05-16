const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: [true, "Movie ID is required for a review"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required for a review"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, "Review comment is required"],
        trim: true,
        maxlength: [500, "Comment cannot be more than 500 characters"]
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
});

// Prevent a user from submitting more than one review per movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

// Static method to get average rating of a movie
reviewSchema.statics.getAverageRating = async function(movieId) {
    const obj = await this.aggregate([{
            $match: { movie: movieId }
        },
        {
            $group: {
                _id: '$movie',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        // Update movie model with average rating
        if (obj[0]) {
            await this.model('Movie').findByIdAndUpdate(movieId, {
                rating: obj[0].averageRating.toFixed(1)
            });
        } else {
            // If no reviews, set rating to 0
            await this.model('Movie').findByIdAndUpdate(movieId, {
                rating: 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.movie);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function() {
    this.constructor.getAverageRating(this.movie);
});

module.exports = mongoose.model("Review", reviewSchema);