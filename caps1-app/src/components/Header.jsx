"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Header.css"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            CineTix
          </Link>

          <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/movies" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Phim
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/cinemas" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Rạp chiếu
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/promotions" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Khuyến mãi
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/showtimes" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Lịch Chiếu
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-name">{currentUser?.name || currentUser?.email}</span>
                <div className="dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Tài khoản
                  </Link>
                  <Link to="/bookings" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Vé đã đặt
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
