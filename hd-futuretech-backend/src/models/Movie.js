const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
        type: String,
    },
    duration: {
        type: Number,
        min: 1,
    },
    releaseDate: {
        type: Date,
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
    },
    director: {
        type: String,
    },
    cast: {
        type: [String],
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
        },
        date: {
            type: Date,
        },
        times: [String],
    }, ],
}, { timestamps: true });

// Create index for search
movieSchema.index({ title: "text", director: "text", cast: "text" });

module.exports = mongoose.model("Movie", movieSchema);