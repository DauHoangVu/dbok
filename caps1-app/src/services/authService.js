// Store authentication token
export const storeToken = (token) => {
    localStorage.setItem("auth_token", token)
  }
  
  // Get stored authentication token
  export const getStoredToken = () => {
    return localStorage.getItem("auth_token")
  }
  
  // Store user data
  export const storeUser = (user) => {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
  
  // Get stored user data
  export const getStoredUser = () => {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  }
  
  // Remove all authentication data
  export const removeAuthData = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return !!getStoredToken()
  }