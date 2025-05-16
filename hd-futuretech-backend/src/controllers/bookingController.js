const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");
const mongoose = require("mongoose");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async(req, res, next) => {
    try {
        const {
            movieId,
            cinemaId,
            showtime,
            seats,
            totalAmount,
        } = req.body;

        // Validate required fields
        if (!movieId || !cinemaId || !showtime || !seats || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required booking information",
            });
        }

        // Validate that movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        // For development/testing purposes - handle string cinema IDs
        // Since in the frontend we're using hardcoded string cinema IDs
        let cinema;
        if (mongoose.Types.ObjectId.isValid(cinemaId)) {
            cinema = await Cinema.findById(cinemaId);
        } else {
            cinema = await Cinema.findOne({ identifier: cinemaId });

            // If cinema doesn't exist with this identifier, create a temporary one for testing
            if (!cinema) {
                let name = "CineStar Quận 1";
                if (cinemaId === "2") {
                    name = "CineStar Quận 7";
                }

                cinema = await Cinema.create({
                    identifier: cinemaId,
                    name,
                    location: {
                        address: "123 Example Street",
                        district: cinemaId === "1" ? "Quận 1" : "Quận 7",
                        city: "Hồ Chí Minh"
                    }
                });
            }
        }

        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: "Cinema not found",
            });
        }

        // Check if seats are available by looking for existing bookings with the same criteria
        const existingBooking = await Booking.findOne({
            movie: movieId,
            cinema: cinema._id, // Use the resolved cinema ID
            "showtime.date": new Date(showtime.date),
            "showtime.time": showtime.time,
            seats: { $in: seats },
            bookingStatus: { $ne: "cancelled" },
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "One or more selected seats are already booked",
            });
        }

        // Create the booking
        const booking = await Booking.create({
            user: req.user.id,
            movie: movieId,
            cinema: cinema._id, // Use the resolved cinema ID
            showtime,
            seats,
            totalAmount,
            paymentStatus: "pending", // Initially set to pending
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async(req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("movie", "title posterUrl")
            .populate("cinema", "name location")
            .sort("-createdAt");

        res.status(200).json(bookings);
    } catch (err) {
        next(err);
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async(req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("movie")
            .populate("cinema");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if the booking belongs to the logged-in user or is an admin
        if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this booking",
            });
        }

        res.status(200).json(booking);
    } catch (err) {
        next(err);
    }
};

// @desc    Update booking status (e.g., cancel booking)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async(req, res, next) => {
    try {
        const { bookingStatus } = req.body;

        if (!bookingStatus) {
            return res.status(400).json({
                success: false,
                message: "Please provide booking status",
            });
        }

        // Find booking by ID
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if the booking belongs to the logged-in user or is an admin
        if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this booking",
            });
        }

        // Update booking status
        booking.bookingStatus = bookingStatus;
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
exports.updatePaymentStatus = async(req, res, next) => {
    try {
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "Please provide payment status",
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Only allow admin to update payment status
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update payment status",
            });
        }

        booking.paymentStatus = paymentStatus;
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Check seat availability
// @route   POST /api/bookings/check-seats
// @access  Public
exports.checkSeatAvailability = async(req, res, next) => {
    try {
        const { movieId, cinemaId, showtime, seats } = req.body;

        // Validate required fields
        if (!movieId || !cinemaId || !showtime) {
            return res.status(400).json({
                success: false,
                message: "Please provide movie, cinema and showtime information",
            });
        }

        // Resolve the cinema ID - handle string IDs for development/testing
        let cinemaObjectId;
        if (mongoose.Types.ObjectId.isValid(cinemaId)) {
            cinemaObjectId = cinemaId;
        } else {
            const cinema = await Cinema.findOne({ identifier: cinemaId });
            cinemaObjectId = cinema ? cinema._id : null;

            // If cinema doesn't exist with this identifier, create a temporary one for testing
            if (!cinemaObjectId) {
                let name = "CineStar Quận 1";
                if (cinemaId === "2") {
                    name = "CineStar Quận 7";
                }

                const newCinema = await Cinema.create({
                    identifier: cinemaId,
                    name,
                    location: {
                        address: "123 Example Street",
                        district: cinemaId === "1" ? "Quận 1" : "Quận 7",
                        city: "Hồ Chí Minh"
                    }
                });
                cinemaObjectId = newCinema._id;
            }
        }

        // Find bookings that match the criteria
        const bookings = await Booking.find({
            movie: movieId,
            cinema: cinemaObjectId, // Use the resolved cinema ID
            "showtime.date": new Date(showtime.date),
            "showtime.time": showtime.time,
            bookingStatus: { $ne: "cancelled" },
        });

        // Extract all booked seats
        const bookedSeats = bookings.reduce((acc, booking) => {
            return [...acc, ...booking.seats];
        }, []);

        // If seats array is provided, check if they are available
        let unavailableSeats = [];
        if (seats && Array.isArray(seats) && seats.length > 0) {
            unavailableSeats = seats.filter(seat => bookedSeats.includes(seat));
        }

        res.status(200).json({
            available: !seats || unavailableSeats.length === 0,
            unavailableSeats,
            bookedSeats,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};