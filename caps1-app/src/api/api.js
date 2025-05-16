import axios from "axios"

const API_BASE_URL = "https://cap1-be.vercel.app/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Authentication API
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Registration failed"
  }
}

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Login failed"
  }
}

// Movie API
export const getShowingMovies = async () => {
  try {
    const response = await api.get("/movies/showing")
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch movies"
  }
}

export const getMovieById = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch movie details"
  }
}

// Auth helpers
export const saveAuthToken = (token) => {
  localStorage.setItem("auth_token", token)
}

export const saveUserData = (user) => {
  localStorage.setItem("user_data", JSON.stringify(user))
}

export const getUserData = () => {
  const userData = localStorage.getItem("user_data")
  return userData ? JSON.parse(userData) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem("auth_token")
}

export const logout = () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_data")
}
