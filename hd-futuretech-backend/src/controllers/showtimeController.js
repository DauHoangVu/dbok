// controllers/showtimeController.js
const Showtime = require("../models/Showtime");
const Cinema = require("../models/Cinema");

const getShowtimes = async (req, res) => {
  const { city, date, startTime, endTime } = req.query;

  try {
    // Tìm rạp ở city
    const cinemas = await Cinema.find({ "location.city": city });
    if (!cinemas.length) {
      return res.status(404).json({ message: "Không tìm thấy rạp ở thành phố này" });
    }
    const cinemaIds = cinemas.map(c => c._id);

    // Build filter showTime nếu có startTime và endTime
    const filter = {
      cinemaId: { $in: cinemaIds },
      showDate: date,
    };

    if (startTime && endTime) {
      filter.showTime = { $gte: startTime, $lte: endTime };
    }

    const showtimes = await Showtime.find(filter)
      .populate("movieId", "title")
      .populate("cinemaId", "name location");

    res.status(200).json(showtimes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể lấy lịch chiếu" });
  }
};

module.exports = { getShowtimes };
