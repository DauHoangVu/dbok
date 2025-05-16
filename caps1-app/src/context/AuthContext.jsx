import { createContext, useContext, useState, useEffect } from "react";
import { getStoredToken, getStoredUser, removeAuthData } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (token && user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    removeAuthData();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
