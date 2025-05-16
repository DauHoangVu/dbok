const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a movie title"],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Please provide a movie description"],
    },
    duration: {
        type: Number,
        required: [true, "Please provide the movie duration in minutes"],
        min: 1,
    },
    releaseDate: {
        type: Date,
        required: [true, "Please provide the release date"],
    },
    posterUrl: {
        type: String,
        default: "",
    },
    trailerUrl: {
        type: String,
        default: "",
    },
    genre: {
        type: [String],
        required: [true, "Please provide at least one genre"],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: "At least one genre must be specified",
        },
    },
    director: {
        type: String,
        required: [true, "Please provide the director name"],
    },
    cast: {
        type: [String],
        required: [true, "Please provide the cast"],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: "At least one cast member must be specified",
        },
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    isShowing: {
        type: Boolean,
        default: true,
    },
    showtimes: [{
        cinema: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cinema",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        times: [String],
    }, ],
}, { timestamps: true });

// Create index for search
movieSchema.index({ title: "text", director: "text", cast: "text" });

module.exports = mongoose.model("Movie", movieSchema);