"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { loginUser } from "../services/api"
import { storeToken, storeUser } from "../services/authService"
import { useAuth } from "../context/AuthContext"
import "../styles/LoginPage.css"

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentUser, setIsAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Check if we were redirected from booking page
  const redirectMessage = location.state?.message
  const returnUrl = location.state?.returnUrl || "/"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")  // Xóa lỗi cũ trước khi kiểm tra
  
    if (!formData.emailOrPhone || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }
  
    try {
      setLoading(true)
      const response = await loginUser(formData)
  
      // Store auth data
      storeToken(response.token)
      storeUser(response.user)
  
      // Update auth context
      setCurrentUser(response.user)
      setIsAuthenticated(true)
  
      // Redirect to original page or home
      navigate(returnUrl)
    } catch (error) {
      console.error("Login error:", error)  // Log lỗi chi tiết để debug
  
      // Cải thiện hiển thị thông báo lỗi
      if (error?.response?.data?.message) {
        setError(error.response.data.message)  // Hiển thị thông báo lỗi chi tiết từ backend
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.")
      }
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">Đăng nhập để tiếp tục</p>

            {redirectMessage && (
              <div className="auth-message">{redirectMessage}</div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="emailOrPhone" className="form-label">
                  Email hoặc số điện thoại
                </label>
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  className="form-input"
                  placeholder="Email hoặc số điện thoại"
                  value={formData.emailOrPhone}
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

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="auth-link">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
