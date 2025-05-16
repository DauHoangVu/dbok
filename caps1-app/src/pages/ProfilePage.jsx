"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getUserBookings } from "../services/api"
import "../styles/ProfilePage.css"

const ProfilePage = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch user bookings when the bookings tab is active and user is logged in
    const fetchBookings = async () => {
      if (activeTab === "bookings" && currentUser) {
        try {
          setLoading(true)
          const data = await getUserBookings()
          setBookings(data)
          setError(null)
        } catch (err) {
          console.error("Failed to fetch bookings:", err)
          setError("Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchBookings()
  }, [activeTab, currentUser])

  if (!currentUser) {
    return (
      <div className="container">
        <div className="profile-not-logged-in">
          <h2>Vui lòng đăng nhập để xem thông tin tài khoản</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Tài khoản của tôi</h1>

        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-user-info">
              <div className="profile-avatar">{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}</div>
              <div className="profile-user-details">
                <h3 className="profile-user-name">{currentUser.name}</h3>
                <p className="profile-user-email">{currentUser.email}</p>
              </div>
            </div>

            <div className="profile-tabs">
              <button
                className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Thông tin cá nhân
              </button>
              <button
                className={`profile-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                Lịch sử đặt vé
              </button>
              <button
                className={`profile-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => setActiveTab("preferences")}
              >
                Sở thích phim
              </button>
              <button
                className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Cài đặt tài khoản
              </button>
            </div>
          </div>

          <div className="profile-content">
            {activeTab === "profile" && (
              <div className="profile-tab-content">
                <h2 className="profile-section-title">Thông tin cá nhân</h2>
                <div className="profile-info-card">
                  <div className="profile-info-row">
                    <span className="profile-info-label">Họ tên</span>
                    <span className="profile-info-value">{currentUser.name}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">{currentUser.email}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Số điện thoại</span>
                    <span className="profile-info-value">{currentUser.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Ngày tham gia</span>
                    <span className="profile-info-value">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString()
                        : "Không có thông tin"}
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary profile-edit-btn">Chỉnh sửa thông tin</button>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="profile-tab-content">
                <h2 className="profile-section-title">Lịch sử đặt vé</h2>
                
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải lịch sử đặt vé...</p>
                  </div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="bookings-list">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="booking-card">
                        <div className="booking-header">
                          <h3 className="booking-movie-title">{booking.movie.title}</h3>
                          <span className="booking-number">#{booking.bookingNumber}</span>
                        </div>
                        <div className="booking-details">
                          <div className="booking-info">
                            <p><strong>Rạp:</strong> {booking.cinema.name}</p>
                            <p><strong>Ngày:</strong> {new Date(booking.showtime.date).toLocaleDateString()}</p>
                            <p><strong>Giờ:</strong> {booking.showtime.time}</p>
                            <p><strong>Ghế:</strong> {booking.seats.join(", ")}</p>
                            <p><strong>Tổng tiền:</strong> {booking.totalAmount.toLocaleString()}đ</p>
                          </div>
                          <div className="booking-status">
                            <span className={`status-badge ${booking.bookingStatus}`}>
                              {booking.bookingStatus === "active" ? "Đang hoạt động" : 
                               booking.bookingStatus === "used" ? "Đã sử dụng" : 
                               booking.bookingStatus === "cancelled" ? "Đã hủy" : "Hết hạn"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-bookings-empty">
                    <p>Bạn chưa có lịch sử đặt vé nào.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="profile-tab-content">
                <h2 className="profile-section-title">Sở thích phim</h2>
                <div className="profile-preferences">
                  <div className="profile-preferences-section">
                    <h3 className="profile-preferences-title">Thể loại yêu thích</h3>
                    <div className="profile-preferences-tags">
                      <span className="profile-preference-tag">Hành động</span>
                      <span className="profile-preference-tag">Khoa học viễn tưởng</span>
                      <span className="profile-preference-tag">Phiêu lưu</span>
                      <button className="profile-preference-add">+ Thêm</button>
                    </div>
                  </div>

                  <div className="profile-preferences-section">
                    <h3 className="profile-preferences-title">Đạo diễn yêu thích</h3>
                    <div className="profile-preferences-tags">
                      <button className="profile-preference-add">+ Thêm</button>
                    </div>
                  </div>

                  <div className="profile-preferences-section">
                    <h3 className="profile-preferences-title">Diễn viên yêu thích</h3>
                    <div className="profile-preferences-tags">
                      <button className="profile-preference-add">+ Thêm</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="profile-tab-content">
                <h2 className="profile-section-title">Cài đặt tài khoản</h2>
                <div className="profile-settings">
                  <div className="profile-settings-section">
                    <h3 className="profile-settings-title">Đổi mật khẩu</h3>
                    <form className="profile-password-form">
                      <div className="form-group">
                        <label className="form-label">Mật khẩu hiện tại</label>
                        <input type="password" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
                        <input type="password" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input type="password" className="form-input" />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Cập nhật mật khẩu
                      </button>
                    </form>
                  </div>

                  <div className="profile-settings-section">
                    <h3 className="profile-settings-title">Thông báo</h3>
                    <div className="profile-notification-settings">
                      <div className="profile-notification-option">
                        <input type="checkbox" id="email-notifications" />
                        <label htmlFor="email-notifications">Nhận thông báo qua email</label>
                      </div>
                      <div className="profile-notification-option">
                        <input type="checkbox" id="sms-notifications" />
                        <label htmlFor="sms-notifications">Nhận thông báo qua SMS</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
