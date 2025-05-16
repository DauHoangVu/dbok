const Cinema = require("../models/Cinema");

// @desc    Get all cinemas
// @route   GET /api/cinemas
// @access  Public
exports.getCinemas = async(req, res, next) => {
    try {
        const cinemas = await Cinema.find({ isActive: true });

        res.status(200).json(cinemas);
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single cinema
// @route   GET /api/cinemas/:id
// @access  Public
exports.getCinema = async(req, res, next) => {
    try {
        const cinema = await Cinema.findById(req.params.id);

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: "Cinema not found",
            });
        }

        res.status(200).json(cinema);
    } catch (err) {
        next(err);
    }
};

// @desc    Create a cinema
// @route   POST /api/cinemas
// @access  Private/Admin
exports.createCinema = async(req, res, next) => {
    try {
        const cinema = await Cinema.create(req.body);

        res.status(201).json({
            success: true,
            message: "Cinema created successfully",
            data: cinema,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a cinema
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
exports.updateCinema = async(req, res, next) => {
    try {
        const cinema = await Cinema.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        );

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: "Cinema not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cinema updated successfully",
            data: cinema,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a cinema
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
exports.deleteCinema = async(req, res, next) => {
    try {
        const cinema = await Cinema.findByIdAndDelete(req.params.id);

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: "Cinema not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cinema deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get cinemas by city
// @route   GET /api/cinemas/city/:city
// @access  Public
exports.getCinemasByCity = async(req, res, next) => {
    try {
        const { city } = req.params;

        const cinemas = await Cinema.find({
            isActive: true,
            "location.city": { $regex: city, $options: "i" },
        });

        res.status(200).json(cinemas);
    } catch (err) {
        next(err);
    }
};