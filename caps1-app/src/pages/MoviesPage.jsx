"use client"

import { useState, useEffect } from "react"
import { getShowingMovies } from "../services/api"
import MovieCard from "../components/MovieCard"
import "../styles/MoviesPage.css"

const MoviesPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenres, setSelectedGenres] = useState([])
  const [sortBy, setSortBy] = useState("newest")
  const [allGenres, setAllGenres] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const data = await getShowingMovies()
        
        if (data && Array.isArray(data)) {
          setMovies(data)

          // Extract all unique genres
          const genres = Array.from(new Set(data.flatMap((movie) => movie.genre || []))).sort()
          setAllGenres(genres)

          setError(null)
        } else {
          throw new Error("Dữ liệu phim không hợp lệ.")
        }
      } catch (err) {
        console.error("Failed to fetch movies:", err)
        setError("Không thể tải danh sách phim. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Filter movies based on search query and selected genres
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenres.length === 0 || movie.genre.some((genre) => selectedGenres.includes(genre))
    return matchesSearch && matchesGenre
  })

  // Sort movies based on selected sort option
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    } else if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0)
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSortBy("newest")
    setSearchQuery("")
  }

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
    <div className="movies-page">
      <div className="container">
        <h1 className="page-title">Phim</h1>

        <div className="search-sort-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="sort-filter-container">
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="title">Tên (A-Z)</option>
            </select>

            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"} 🔍
            </button>
          </div>
        </div>

        <div className="content-container">
          {showFilters && (
            <div className="filters-container">
              <h3 className="filter-title">Thể loại</h3>
              <div className="genres-list">
                {allGenres.map((genre) => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="movies-container">
            {selectedGenres.length > 0 && (
              <div className="active-filters">
                <span>Bộ lọc đang dùng: </span>
                {selectedGenres.map((genre) => (
                  <span key={genre} className="active-filter">
                    {genre}
                    <button className="remove-filter" onClick={() => handleGenreToggle(genre)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {sortedMovies.length > 0 ? (
              <div className="movies-grid">
                {sortedMovies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>Không tìm thấy phim phù hợp với tiêu chí của bạn.</p>
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoviesPage
