import React, { useEffect, useState } from "react";
import "../styles/ShowtimePage.css"
import { getShowtimes } from "../services/api";

const ShowtimePage = () => {
  const [city, setCity] = useState("HoChiMinh");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        // Gửi thêm startTime và endTime trong query
        const data = await getShowtimes(city, date, startTime, endTime);
        setShowtimes(data.data || data);
      } catch (err) {
        console.error("Lỗi khi lấy lịch chiếu:", err);
      }
    };

    fetchShowtimes();
  }, [city, date, startTime, endTime]);

  return (
    <div className="showtimes-page">
      <h2>🎬 Lịch chiếu phim</h2>

      <div className="filters">
        <label>
          Thành phố:
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="HoChiMinh">TP.HCM</option>
            <option value="HaNoi">Hà Nội</option>
            <option value="DaNang">Đà Nẵng</option>
          </select>
        </label>

        <label>
          Ngày:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          Giờ bắt đầu:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>

        <label>
          Giờ kết thúc:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
      </div>

      <div className="showtime-list">
        {showtimes.length === 0 && <p>Không có lịch chiếu trong khung giờ này.</p>}
        {showtimes.map((s) => (
          <div key={s._id} className="showtime-card">
            <h3>{s.movieId.title}</h3>
            <p><strong>Rạp:</strong> {s.cinemaId.name}</p>
            <p><strong>Giờ chiếu:</strong> {s.showTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowtimePage;
