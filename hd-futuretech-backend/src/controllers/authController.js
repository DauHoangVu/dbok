const User = require("../models/User");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.register = async(req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Create the user
        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        // Generate token
        const token = user.getSignedJwtToken();

        // Don't send password in the response
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async(req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;

        // Validate email/phone and password
        if (!emailOrPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email/phone and password",
            });
        }

        // Check if user exists by email or phone
        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate token
        const token = user.getSignedJwtToken();

        // Don't send password in the response
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async(req, res, next) => {
    try {
        const { name, phone } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields, { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async(req, res, next) => {
    try {
        const { favoriteGenres, favoriteDirectors, favoriteActors } = req.body;

        const updateFields = { preferences: {} };
        if (favoriteGenres) updateFields.preferences.favoriteGenres = favoriteGenres;
        if (favoriteDirectors) updateFields.preferences.favoriteDirectors = favoriteDirectors;
        if (favoriteActors) updateFields.preferences.favoriteActors = favoriteActors;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields, { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Preferences updated successfully",
            data: user,
        });
    } catch (err) {
        next(err);
    }
};