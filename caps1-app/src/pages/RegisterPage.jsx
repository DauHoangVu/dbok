"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/api"
import { storeToken, storeUser } from "../services/authService"
import { useAuth } from "../context/AuthContext"
import "../styles/LoginPage.css"

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setCurrentUser, setIsAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
  
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }
  
    if (!acceptTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng")
      return
    }
  
    try {
      setLoading(true)
      // Sửa lại cấu trúc dữ liệu gửi đi cho đúng với backend yêu cầu
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
  
      // Lưu token và thông tin user vào storage
      storeToken(response.token)
      storeUser(response.user)
  
      // Cập nhật context auth
      setCurrentUser(response.user)
      setIsAuthenticated(true)
  
      // Điều hướng về trang chủ
      navigate("/")
    } catch (error) {
      console.error("Registration error:", error)
      setError(typeof error === "string" ? error : "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Đăng ký</h1>
            <p className="auth-subtitle">Tạo tài khoản mới</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Họ tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Họ tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="terms-container">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <label htmlFor="terms">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="auth-link">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="auth-link">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Đã có tài khoản?{" "}
                <Link to="/login" className="auth-link">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
