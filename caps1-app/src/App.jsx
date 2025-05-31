import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Header from "./components/Header"
import Footer from "./components/Footer"
import HomePage from "./pages/HomePage"
import MoviesPage from "./pages/MoviesPage"
import MovieDetailPage from "./pages/MovieDetailPage"
import BookingPage from "./pages/BookingPage"
import CinemasPage from "./pages/CinemasPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"
import "./styles/global.css"
import AdminLayout from "./pages/AdminPage"
import AdminDashboard from "./pages/AdminDashboard"
import MovieManagement from "./pages/MovieManagement"
import CinemaManagement from "./pages/CinemaManagement"
import Analytic from "./pages/Analytic"
import ShowtimePage from "./pages/ShowtimePage";
import PromotionPage from "./pages/PromotionPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              <Route path="/movies/:id/booking" element={<BookingPage />} />
              <Route path="/cinemas" element={<CinemasPage />} />
              <Route path="/promotions" element={<PromotionPage/>} />
              <Route path="/showtimes" element={<ShowtimePage/>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/movies" element={<MovieManagement />} />
            <Route path="/admin/cinema" element={<CinemaManagement />} />
            <Route path="/admin/analytic" element={<Analytic />} />
          </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
