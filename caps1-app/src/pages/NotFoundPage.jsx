import { Link } from "react-router-dom"
import "../styles/NotFoundPage.css"

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Trang không tồn tại</h2>
          <p className="not-found-message">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
          <Link to="/" className="btn btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
