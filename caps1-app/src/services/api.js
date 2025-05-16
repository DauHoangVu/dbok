import axios from "axios"
import { getStoredToken } from "./authService"

const API_BASE_URL = "http://localhost:8769/api"

// Tạo axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Gắn token vào headers nếu có
api.interceptors.request.use(
    (config) => {
        const token = getStoredToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Helper để bắt lỗi gọn
const handleError = (error, fallback = "Có lỗi xảy ra") => {
    console.error("API Error:", error)
    return error.response ? error.response.data ? error.response.data.message : fallback : fallback
}

export const registerUser = async(userData) => {
    try {
        const response = await api.post("/users/register", {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
        })
        return response.data
    } catch (error) {
        throw handleError(error, "Đăng ký thất bại")
    }
}

export const loginUser = async(credentials) => {
    try {
        // Gửi dữ liệu đăng nhập
        const response = await api.post("/users/login", credentials)
        return response.data
    } catch (error) {
        // Log lỗi chi tiết để dễ dàng debug
        console.error("Login error:", error)

        // Nếu không có thông báo lỗi chi tiết từ API, sử dụng thông báo mặc định
        throw new Error("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.")
    }
}

export const getCurrentUser = async() => {
    try {
        const response = await api.get("/users/me")
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy thông tin người dùng")
    }
}

export const updateUserProfile = async(profileData) => {
    try {
        const response = await api.put("/users/profile", profileData)
        return response.data
    } catch (error) {
        throw handleError(error, "Cập nhật thông tin thất bại")
    }
}

export const updateUserPreferences = async(preferencesData) => {
    try {
        const response = await api.put("/users/preferences", preferencesData)
        return response.data
    } catch (error) {
        throw handleError(error, "Cập nhật sở thích thất bại")
    }
}

export const getMovies = async(params = {}) => {
    try {
        const response = await api.get("/movies", { params })
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy danh sách phim")
    }
}

export const getShowingMovies = async(params = {}) => {
    try {
        const response = await api.get("/movies/showing", { params })
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy danh sách phim đang chiếu")
    }
}

export const getMovieById = async(id) => {
    try {
        const response = await api.get(`/movies/${id}`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy thông tin phim")
    }
}

export const searchMovies = async(query) => {
    try {
        const response = await api.get("/movies/search", { params: { q: query } })
        return response.data
    } catch (error) {
        throw handleError(error, "Tìm kiếm phim thất bại")
    }
}

export const getCinemas = async() => {
    try {
        const response = await api.get("/cinemas")
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy danh sách rạp chiếu")
    }
}

export const getCinemaById = async(id) => {
    try {
        const response = await api.get(`/cinemas/${id}`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy thông tin rạp chiếu")
    }
}

export const getCinemasByCity = async(city) => {
    try {
        const response = await api.get(`/cinemas/city/${city}`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy danh sách rạp chiếu theo thành phố")
    }
}

export const createBooking = async(bookingData) => {
    try {
        const response = await api.post("/bookings", bookingData)
        return response.data
    } catch (error) {
        throw handleError(error, "Đặt vé thất bại")
    }
}

export const getUserBookings = async() => {
    try {
        const response = await api.get("/bookings")
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy lịch sử đặt vé")
    }
}

export const getBookingById = async(id) => {
    try {
        const response = await api.get(`/bookings/${id}`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy thông tin đặt vé")
    }
}

export const updateBookingStatus = async(id, status) => {
    try {
        const response = await api.put(`/bookings/${id}`, { bookingStatus: status })
        return response.data
    } catch (error) {
        throw handleError(error, "Cập nhật trạng thái đặt vé thất bại")
    }
}

export const checkSeatAvailability = async(checkData) => {
    try {
        const response = await api.post("/bookings/check-seats", checkData)
        return response.data
    } catch (error) {
        throw handleError(error, "Kiểm tra chỗ ngồi thất bại")
    }
}

// === Review APIs ===
export const getMovieReviews = async(movieId) => {
    try {
        const response = await api.get(`/movies/${movieId}/reviews`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể lấy đánh giá phim")
    }
}

export const createReview = async(movieId, reviewData) => {
    try {
        const response = await api.post(`/movies/${movieId}/reviews`, reviewData)
        return response.data
    } catch (error) {
        throw handleError(error, "Gửi đánh giá thất bại")
    }
}

export const updateReview = async(reviewId, reviewData) => {
    try {
        const response = await api.put(`/reviews/${reviewId}`, reviewData)
        return response.data
    } catch (error) {
        throw handleError(error, "Cập nhật đánh giá thất bại")
    }
}

export const deleteReview = async(reviewId) => {
    try {
        const response = await api.delete(`/reviews/${reviewId}`)
        return response.data
    } catch (error) {
        throw handleError(error, "Xóa đánh giá thất bại")
    }
}

export const likeReview = async(reviewId) => {
    try {
        const response = await api.put(`/reviews/${reviewId}/like`)
        return response.data
    } catch (error) {
        throw handleError(error, "Không thể thích đánh giá")
    }
}

export default api