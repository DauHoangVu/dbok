const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true,
    },
    cinema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cinema",
        required: true,
    },
    showtime: {
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
    },
    seats: {
        type: [String],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: "At least one seat must be selected",
        },
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    bookingNumber: {
        type: String,
        unique: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },
    bookingStatus: {
        type: String,
        enum: ["active", "used", "cancelled", "expired"],
        default: "active",
    },
}, { timestamps: true });

// Generate unique booking number before saving
bookingSchema.pre("save", function(next) {
    if (!this.bookingNumber) {
        // Format: CIN-YYYYMMDD-XXXX (X is random)
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, "0") +
            date.getDate().toString().padStart(2, "0");

        const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
        this.bookingNumber = `CIN-${dateStr}-${randomPart}`;
    }
    next();
});

module.exports = mongoose.model("Booking", bookingSchema);