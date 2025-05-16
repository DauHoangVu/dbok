import { Link } from "react-router-dom"
import "../styles/Footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">CineTix</h3>
            <p className="footer-description">
              Nền tảng đặt vé xem phim trực tuyến với công nghệ AI giúp bạn tìm kiếm bộ phim phù hợp nhất.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                Facebook
              </a>
              <a href="#" className="social-link">
                Twitter
              </a>
              <a href="#" className="social-link">
                Instagram
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/movies">Phim</Link>
              </li>
              <li>
                <Link to="/cinemas">Rạp chiếu</Link>
              </li>
              <li>
                <Link to="/promotions">Khuyến mãi</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Hỗ trợ</h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="/terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Tải ứng dụng</h3>
            <p className="footer-description">Trải nghiệm đặt vé tốt nhất trên thiết bị di động của bạn.</p>
            <div className="app-links">
              <a href="#" className="app-link">
                App Store
              </a>
              <a href="#" className="app-link">
                Google Play
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} CineTix. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
