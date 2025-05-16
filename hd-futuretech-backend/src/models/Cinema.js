const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema({
    identifier: {
        type: String,
        unique: true,
        sparse: true, // Allow null/undefined values
    },
    name: {
        type: String,
        required: [true, "Please provide cinema name"],
        trim: true,
        maxlength: [100, "Name cannot be more than 100 characters"],
    },
    location: {
        address: {
            type: String,
            required: [true, "Please provide an address"],
        },
        city: {
            type: String,
            required: [true, "Please provide a city"],
        },
        district: {
            type: String,
            required: [true, "Please provide a district"],
        },
    },
    screens: [{
        name: {
            type: String,
            required: true,
        },
        totalSeats: {
            type: Number,
            required: true,
        },
        seatingLayout: {
            rows: {
                type: Number,
                required: true,
            },
            columns: {
                type: Number,
                required: true,
            },
        },
    }, ],
    facilities: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Cinema", cinemaSchema);