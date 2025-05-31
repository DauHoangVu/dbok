const express = require("express");
const router = express.Router();
const { getShowtimes } = require("../controllers/showtimeController");

// Public route - lấy danh sách lịch chiếu theo city và date
router.get("/", getShowtimes);

module.exports = router;
