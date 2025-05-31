const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");
const mongoose = require("mongoose");
const dayjs = require('dayjs');
const stripe = require('stripe')


// @desc    Create a PaymentIntent for Stripe
// @route   POST /api/bookings/create-payment-intent
// @access  Public
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp số tiền hợp lệ",
      });
    }

    const paymentIntent = await Stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe yêu cầu số tiền ở đơn vị nhỏ nhất (VND không có đơn vị nhỏ hơn)
      currency: "vnd",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo PaymentIntent",
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const {
      movieId,
      cinemaId,
      showtime,
      seats,
      totalAmount,
      paymentIntentId, // Thêm paymentIntentId từ frontend
    } = req.body;

    // Validate required fields
    if (!movieId || !cinemaId || !showtime || !seats || !totalAmount || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin đặt vé và thanh toán",
      });
    }

    // Xác nhận thanh toán qua Stripe
    const paymentIntent = await Stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Thanh toán chưa hoàn tất",
      });
    }

    // Kiểm tra số tiền thanh toán
    if (paymentIntent.amount !== Math.round(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Số tiền thanh toán không khớp với tổng tiền đặt vé",
      });
    }

    // Validate that movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phim",
      });
    }

    // For development/testing purposes - handle string cinema IDs
    let cinema;
    if (mongoose.Types.ObjectId.isValid(cinemaId)) {
      cinema = await Cinema.findById(cinemaId);
    } else {
      cinema = await Cinema.findOne({ identifier: cinemaId });

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
            city: "Hồ Chí Minh",
          },
        });
      }
    }

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy rạp chiếu",
      });
    }

    // Check if seats are available
    const existingBooking = await Booking.findOne({
      movie: movieId,
      cinema: cinema._id,
      "showtime.date": new Date(showtime.date),
      "showtime.time": showtime.time,
      seats: { $in: seats },
      bookingStatus: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Một hoặc nhiều ghế đã được đặt",
      });
    }

    // Create the booking
    const booking = await Booking.create({
      user: req.user.id,
      movie: movieId,
      cinema: cinema._id,
      showtime,
      seats,
      totalAmount,
      paymentStatus: "completed", // Cập nhật trạng thái thanh toán
      paymentIntentId, // Lưu paymentIntentId để tham chiếu
    });

    res.status(201).json({
      success: true,
      message: "Đặt vé thành công",
      data: booking,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// Các hàm khác giữ nguyên
exports.getUserBookings = async (req, res, next) => {
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

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("movie")
      .populate("cinema");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé",
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập vé này",
      });
    }

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body;

    if (!bookingStatus) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái đặt vé",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé",
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật vé này",
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đặt vé thành công",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái thanh toán",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật trạng thái thanh toán",
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.checkSeatAvailability = async (req, res, next) => {
  try {
    const { movieId, cinemaId, showtime, seats } = req.body;

    if (!movieId || !cinemaId || !showtime) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp thông tin phim, rạp và suất chiếu",
      });
    }

    let cinemaObjectId;
    if (mongoose.Types.ObjectId.isValid(cinemaId)) {
      cinemaObjectId = cinemaId;
    } else {
      const cinema = await Cinema.findOne({ identifier: cinemaId });
      cinemaObjectId = cinema ? cinema._id : null;

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
            city: "Hồ Chí Minh",
          },
        });
        cinemaObjectId = newCinema._id;
      }
    }

    const bookings = await Booking.find({
      movie: movieId,
      cinema: cinemaObjectId,
      "showtime.date": new Date(showtime.date),
      "showtime.time": showtime.time,
      bookingStatus: { $ne: "cancelled" },
    });

    const bookedSeats = bookings.reduce((acc, booking) => {
      return [...acc, ...booking.seats];
    }, []);

    let unavailableSeats = [];
    if (seats && Array.isArray(seats) && seats.length > 0) {
      unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));
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

exports.getBookingStats = async (req, res) => {
  try {
    const now = dayjs();
    const currentWeekStart = now.startOf("isoWeek").toDate();
    const currentWeekEnd = now.endOf("isoWeek").toDate();

    const lastWeekStart = now.subtract(1, "week").startOf("isoWeek").toDate();
    const lastWeekEnd = now.subtract(1, "week").endOf("isoWeek").toDate();

    const [allTime, thisWeek, lastWeek] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: currentWeekStart, $lte: currentWeekEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      allTime: allTime[0] || { total: 0, count: 0 },
      thisWeek: thisWeek[0] || { total: 0, count: 0 },
      lastWeek: lastWeek[0] || { total: 0, count: 0 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};