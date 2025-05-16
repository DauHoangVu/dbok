const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify token
exports.protect = async(req, res, next) => {
    let token;

    // Check for token in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, "cinetix_secret_key_jwt_auth_2023");

        // Set req.user to the user found by the ID in the token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found with this ID",
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }

        next();
    };
};