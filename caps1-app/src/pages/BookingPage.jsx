"use client"

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieById, getCinemas, checkSeatAvailability, createPaymentIntent, createBooking } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "../styles/BookingPage.css";

const stripePromise = loadStripe("pk_test_51RUpWdFJonO1LiN5z7CgYJ7P8nc9sJaGHjSDxLqrXpN6ZYr9m45Urlxc9asN6mXLGb1PSQ9doav606cdHk2A3ZHo00hUfcOXBX"); // Thay bằng khóa công khai của Stripe từ Dashboard

const PaymentForm = ({ totalPrice, onSuccess, onError, isSubmitting }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    try {
      const { clientSecret } = await createPaymentIntent(totalPrice);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        onError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        onSuccess(result.paymentIntent);
      }
    } catch (error) {
      onError("Lỗi xử lý thanh toán. Vui lòng thử lại.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#9e2146" },
          },
        }}
      />
      <button
        type="submit"
        className="btn btn-primary next-btn"
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Hoàn tất thanh toán"}
      </button>
    </form>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Date & Showtime
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState("");

  // Step 2: Seat Selection
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isCheckingSeats, setIsCheckingSeats] = useState(false);

  // Step 3: Payment
  const [ticketHold, setTicketHold] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Fetch all cinemas from API
  const [cinemas, setCinemas] = useState([]);
  const [cinemasLoading, setCinemasLoading] = useState(true);

  // Generate dates for next 5 days
  const dates = [
    new Date(Date.now() + 86400000 * 0), // Today
    new Date(Date.now() + 86400000 * 1), // Tomorrow
    new Date(Date.now() + 86400000 * 2),
    new Date(Date.now() + 86400000 * 3),
    new Date(Date.now() + 86400000 * 4),
  ];

  // Generate a grid of seats (8 rows x 12 seats)
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setCinemasLoading(true);
        const data = await getCinemas();
        const processedCinemas = data.map((cinema) => ({
          ...cinema,
          id: cinema._id,
          showtimes: cinema.showtimes || ["10:30", "13:45", "17:00", "20:15"],
        }));
        setCinemas(processedCinemas);
        if (processedCinemas.length > 0 && !selectedCinema) {
          setSelectedCinema(processedCinemas[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch cinemas:", err);
        const defaultCinemas = [
          { id: "1", name: "CineStar Quận 1", showtimes: ["10:30", "13:45", "17:00", "20:15"] },
          { id: "2", name: "CineStar Quận 7", showtimes: ["11:00", "14:15", "17:30", "20:45"] },
        ];
        setCinemas(defaultCinemas);
        if (!selectedCinema) {
          setSelectedCinema(defaultCinemas[0].id);
        }
      } finally {
        setCinemasLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await getMovieById(id);
        setMovie(data);
        setError(null);
        if (dates.length > 0) {
          setSelectedDate(dates[0].toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchMovie();
    }
  }, [id]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (currentStep === 2 && movie && selectedCinema && selectedDate && selectedShowtime) {
        try {
          setIsCheckingSeats(true);
          const response = await checkSeatAvailability({
            movieId: movie._id,
            cinemaId: selectedCinema,
            showtime: { date: selectedDate, time: selectedShowtime },
          });
          setOccupiedSeats(response.bookedSeats || []);
        } catch (err) {
          console.error("Failed to check seat availability:", err);
          setOccupiedSeats([]);
        } finally {
          setIsCheckingSeats(false);
        }
      }
    };
    checkAvailability();
  }, [currentStep, movie, selectedCinema, selectedDate, selectedShowtime]);

  useEffect(() => {
    if (!ticketHold) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTicketHold(false);
          setSelectedSeats([]);
          setCurrentStep(2);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ticketHold]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeatToggle = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedShowtime) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedSeats.length > 0) {
      setTicketHold(true);
      setTimeLeft(600);
      setCurrentStep(3);
    }
  };

  const handlePaymentComplete = async (paymentIntent) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          returnUrl: `/movies/${id}/booking`,
          message: "Vui lòng đăng nhập để hoàn tất đặt vé",
        },
      });
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const totalAmount = selectedSeats.length * ticketPrice + bookingFee + tax;

      const bookingData = {
        movieId: movie._id,
        cinemaId: selectedCinema,
        showtime: { date: selectedDate, time: selectedShowtime },
        seats: selectedSeats,
        totalAmount,
        paymentIntentId: paymentIntent.id, // Gửi paymentIntentId cho backend
      };

      const response = await createBooking(bookingData);
      navigate(`/profile?tab=bookings&new=${response.data._id}`);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("Đặt vé thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCinemaDetails = cinemas.find(
    (cinema) => cinema.id.toString() === selectedCinema?.toString()
  );
  const ticketPrice = 90000; // 90,000 VND
  const bookingFee = 10000; // 10,000 VND
  const tax = selectedSeats.length * ticketPrice * 0.1;
  const totalPrice = selectedSeats.length * ticketPrice + bookingFee + tax;

  if (loading || cinemasLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin đặt vé...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <p className="error-message">{error || "Không tìm thấy phim"}</p>
        <Link to="/movies" className="btn btn-primary">
          Quay lại danh sách phim
        </Link>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="back-link-container">
          <Link to={`/movies/${id}`} className="back-link">
            ← Quay lại thông tin phim
          </Link>
        </div>

        <div className="booking-container">
          <div className="booking-main">
            <h1 className="page-title">Đặt vé</h1>

            <div className="booking-steps">
              <div className={`booking-step ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
                <div className="step-number">1</div>
                <div className="step-label">Suất chiếu</div>
              </div>
              <div className={`booking-step ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
                <div className="step-number">2</div>
                <div className="step-label">Chỗ ngồi</div>
              </div>
              <div className={`booking-step ${currentStep === 3 ? "active" : ""}`}>
                <div className="step-number">3</div>
                <div className="step-label">Thanh toán</div>
              </div>
            </div>

            <div className="booking-content">
              {currentStep === 1 && (
                <div className="showtimes-step">
                  <div className="booking-card">
                    <h2 className="card-title">Chọn ngày và suất chiếu</h2>

                    <div className="date-selection">
                      <h3 className="section-label">Ngày</h3>
                      <div className="dates-container">
                        {dates.map((date) => (
                          <button
                            key={date.toISOString()}
                            className={`date-btn ${selectedDate === date.toISOString().split("T")[0] ? "selected" : ""}`}
                            onClick={() => setSelectedDate(date.toISOString().split("T")[0])}
                          >
                            {formatDate(date)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cinema-selection">
                      <h3 className="section-label">Rạp chiếu</h3>
                      <select
                        className="cinema-select"
                        value={selectedCinema}
                        onChange={(e) => setSelectedCinema(e.target.value)}
                      >
                        {cinemas.map((cinema) => (
                          <option key={cinema.id} value={cinema.id}>
                            {cinema.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="showtime-selection">
                      <h3 className="section-label">Suất chiếu</h3>
                      <div className="showtimes-container">
                        {selectedCinemaDetails?.showtimes.map((time) => (
                          <button
                            key={time}
                            className={`showtime-btn ${selectedShowtime === time ? "selected" : ""}`}
                            onClick={() => setSelectedShowtime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        className="btn btn-primary next-btn"
                        onClick={handleNextStep}
                        disabled={!selectedShowtime}
                      >
                        Tiếp tục chọn chỗ ngồi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="seats-step">
                  <div className="booking-card">
                    <h2 className="card-title">Chọn chỗ ngồi</h2>

                    <div className="screen-container">
                      <div className="screen">Màn hình</div>
                    </div>

                    <div className="seating-chart">
                      {rows.map((row) => (
                        <div key={row} className="seat-row">
                          <div className="row-label">{row}</div>
                          <div className="seats">
                            {Array.from({ length: seatsPerRow }).map((_, index) => {
                              const seatNumber = index + 1;
                              const seatId = `${row}${seatNumber}`;
                              const isOccupied = occupiedSeats.includes(seatId);
                              const isSelected = selectedSeats.includes(seatId);

                              return (
                                <button
                                  key={seatId}
                                  className={`seat ${isOccupied ? "occupied" : ""} ${isSelected ? "selected" : ""}`}
                                  onClick={() => handleSeatToggle(seatId)}
                                  disabled={isOccupied}
                                >
                                  {seatNumber}
                                </button>
                              );
                            })}
                          </div>
                          <div className="row-label">{row}</div>
                        </div>
                      ))}
                    </div>

                    <div className="seat-legend">
                      <div className="legend-item">
                        <div className="legend-box available"></div>
                        <span>Còn trống</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-box selected"></div>
                        <span>Đã chọn</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-box occupied"></div>
                        <span>Đã đặt</span>
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        className="btn btn-primary next-btn"
                        onClick={handleNextStep}
                        disabled={selectedSeats.length === 0}
                      >
                        Tiếp tục thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="payment-step">
                  <div className="booking-card">
                    <h2 className="card-title">Thanh toán</h2>

                    {ticketHold && (
                      <div className="ticket-hold-alert">
                        <div className="alert-icon">⏱️</div>
                        <div className="alert-content">
                          <h3 className="alert-title">Giữ chỗ</h3>
                          <p className="alert-message">Chỗ ngồi của bạn được giữ trong:</p>
                          <div className="countdown-timer">
                            <div className="countdown-time">{formatTime(timeLeft)}</div>
                            <div className="countdown-progress">
                              <div className="progress-bar" style={{ width: `${(timeLeft / 600) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="payment-methods">
                      <h3 className="section-label">Phương thức thanh toán</h3>
                      <div className="payment-options">
                        <button className="payment-option selected">
                          <div className="payment-icon">💳</div>
                          <span>Thẻ tín dụng</span>
                        </button>
                        <button className="payment-option disabled" disabled>
                          <div className="payment-icon">🏦</div>
                          <span>Chuyển khoản (Sắp ra mắt)</span>
                        </button>
                      </div>
                    </div>

                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        totalPrice={totalPrice}
                        onSuccess={handlePaymentComplete}
                        onError={setBookingError}
                        isSubmitting={isSubmitting}
                      />
                    </Elements>

                    {bookingError && (
                      <div className="payment-error">
                        <p>{bookingError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="booking-sidebar">
            <div className="booking-summary">
              <h2 className="summary-title">Thông tin đặt vé</h2>

              <div className="movie-summary">
                <img
                  src={movie.posterUrl || "https://via.placeholder.com/100x150?text=No+Image"}
                  alt={movie.title}
                  className="movie-poster"
                />
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-duration">{movie.duration} phút</p>
                </div>
              </div>

              <div className="booking-details">
                {selectedDate && (
                  <div className="detail-row">
                    <span className="detail-label">Ngày</span>
                    <span className="detail-value">{formatDate(selectedDate)}</span>
                  </div>
                )}
                {selectedCinemaDetails && (
                  <div className="detail-row">
                    <span className="detail-label">Rạp</span>
                    <span className="detail-value">{selectedCinemaDetails.name}</span>
                  </div>
                )}
                {selectedShowtime && (
                  <div className="detail-row">
                    <span className="detail-label">Suất chiếu</span>
                    <span className="detail-value">{selectedShowtime}</span>
                  </div>
                )}
                {selectedSeats.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Ghế</span>
                    <span className="detail-value">{selectedSeats.join(", ")}</span>
                  </div>
                )}
              </div>

              {selectedSeats.length > 0 && (
                <div className="price-summary">
                  <div className="detail-row">
                    <span className="detail-label">Vé ({selectedSeats.length})</span>
                    <span className="detail-value">{(selectedSeats.length * ticketPrice).toLocaleString()}đ</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phí đặt vé</span>
                    <span className="detail-value">{bookingFee.toLocaleString()}đ</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Thuế</span>
                    <span className="detail-value">{tax.toLocaleString()}đ</span>
                  </div>
                  <div className="detail-row total">
                    <span className="detail-label">Tổng cộng</span>
                    <span className="detail-value">{totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;