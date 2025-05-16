"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getShowingMovies } from "../services/api"
import MovieCard from "../components/MovieCard"
import "../styles/HomePage.css"

const HomePage = () => {
  const [movies, setMovies] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const data = await getShowingMovies()
        setMovies(data)

        // Set featured movie (highest rated or first movie)
        if (data.length > 0) {
          const sortedMovies = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0))
          setFeaturedMovie(sortedMovies[0])
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch movies:", err)
        setError("Không thể tải danh sách phim. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Trải nghiệm điện ảnh tuyệt vời</h1>
            <p className="hero-subtitle">Đặt vé dễ dàng, gợi ý phim phù hợp và ưu đãi độc quyền</p>
            <div className="hero-buttons">
              <Link to="/movies" className="btn btn-primary btn-lg">
                Xem phim
              </Link>
              <button className="btn btn-secondary btn-lg">Cách thức hoạt động</button>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="now-showing-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Phim đang chiếu</h2>
            <Link to="/movies" className="view-all">
              Xem tất cả
            </Link>
          </div>
          <div className="movies-grid">
            {movies?.slice(0, 4)?.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Movie Section */}
      {featuredMovie && (
        <section className="featured-movie-section">
          <div className="container">
            <h2 className="section-title">Phim nổi bật</h2>
            <div className="featured-movie">
              <div className="featured-movie-image">
                <img
                  src={featuredMovie.posterUrl || "https://via.placeholder.com/800x500?text=No+Image"}
                  alt={featuredMovie.title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x500?text=No+Image"
                  }}
                />
                <div className="featured-movie-overlay">
                  <div className="featured-movie-info">
                    <h3 className="featured-movie-title">{featuredMovie.title}</h3>
                    <div className="featured-movie-genres">
                      {featuredMovie.genre.map((genre) => (
                        <span key={genre} className="genre-badge">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <Link to={`/movies/${featuredMovie._id}/booking`} className="btn btn-primary">
                      Đặt vé
                    </Link>
                  </div>
                </div>
              </div>
              <div className="featured-movie-details">
                <h3 className="featured-movie-title">{featuredMovie.title}</h3>
                <div className="movie-meta">
                  {featuredMovie.rating && (
                    <span className="movie-rating">
                      <span className="star">★</span> {featuredMovie.rating}/5
                    </span>
                  )}
                  <span className="movie-duration">{featuredMovie.duration} phút</span>
                  <span className="movie-release">{new Date(featuredMovie.releaseDate).toLocaleDateString()}</span>
                </div>
                <p className="movie-description">{featuredMovie.description}</p>
                <div className="movie-cast">
                  <p>
                    <strong>Đạo diễn:</strong> {featuredMovie.director}
                  </p>
                  <p>
                    <strong>Diễn viên:</strong> {featuredMovie.cast.join(", ")}
                  </p>
                </div>
                <Link to={`/movies/${featuredMovie._id}/booking`} className="btn btn-primary">
                  Đặt vé
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-center">Cách thức hoạt động</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon">🎬</div>
              <h3 className="step-title">Chọn phim</h3>
              <p className="step-description">
                Khám phá bộ sưu tập phim với gợi ý được cá nhân hóa dựa trên sở thích của bạn.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">🎟️</div>
              <h3 className="step-title">Chọn ghế</h3>
              <p className="step-description">Chọn ghế ưa thích với sơ đồ chỗ ngồi tương tác.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">⏱️</div>
              <h3 className="step-title">Đặt vé an toàn</h3>
              <p className="step-description">Ghế của bạn được giữ trong 10 phút trong khi bạn hoàn tất thanh toán.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
