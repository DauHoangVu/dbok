
const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true },
  showDate: { type: String, required: true }, // format "2025-06-01"
  showTime: { type: String, required: true }, // format "18:00"
})

module.exports = mongoose.model("Showtime", showtimeSchema);
