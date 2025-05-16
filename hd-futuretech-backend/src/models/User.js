const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
        validate: {
            validator: function(v) {
                return /^\d{10,11}$/.test(v);
            },
            message: "Please provide a valid phone number",
        },
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    preferences: {
        favoriteGenres: [String],
        favoriteDirectors: [String],
        favoriteActors: [String],
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, "cinetix_secret_key_jwt_auth_2023", {
        expiresIn: "1d",
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);