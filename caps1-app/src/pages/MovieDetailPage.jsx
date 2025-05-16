"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getMovieById, getMovieReviews, createReview, updateReview, deleteReview, likeReview } from "../services/api"
import { useAuth } from "../context/AuthContext"
import "../styles/MovieDetailPage.css"

const MovieDetailPage = () => {
  const { id } = useParams()
  const { currentUser, isAuthenticated } = useAuth()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ""
  })
  const [editingReview, setEditingReview] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true)
        const data = await getMovieById(id)
        setMovie(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch movie:", err)
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMovie()
    }
  }, [id])

  // Fetch reviews when tab changes to reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === "reviews" && id) {
        try {
          setReviewsLoading(true)
          const data = await getMovieReviews(id)
          setReviews(data)
          setReviewsError(null)
        } catch (err) {
          console.error("Failed to fetch reviews:", err)
          setReviewsError("Không thể tải đánh giá. Vui lòng thử lại sau.")
        } finally {
          setReviewsLoading(false)
        }
      }
    }

    fetchReviews()
  }, [activeTab, id])

  // Check if current user has already submitted a review
  const userReview = isAuthenticated && reviews.find(
    review => review.user && review.user._id === currentUser._id
  )

  // Handle review form changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value
    }))
  }

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đánh giá phim")
      return
    }

    try {
      setSubmitLoading(true)
      
      if (editingReview) {
        // Update existing review
        const result = await updateReview(editingReview._id, reviewFormData)
        
        // Update the reviews state
        setReviews(reviews.map(review => 
          review._id === editingReview._id ? result.data : review
        ))
        
        setEditingReview(null)
      } else {
        // Create new review
        const result = await createReview(id, reviewFormData)
        
        // Add the new review to the state
        setReviews([result.data, ...reviews])
      }
      
      // Reset form
      setReviewFormData({ rating: 5, comment: "" })
      setShowReviewForm(false)
    } catch (error) {
      console.error("Review submission error:", error)
      alert(error instanceof Error ? error.message : "Không thể gửi đánh giá. Vui lòng thử lại sau.")
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewFormData({
      rating: review.rating,
      comment: review.comment
    })
    setShowReviewForm(true)
  }

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return
    }
    
    try {
      await deleteReview(reviewId)
      setReviews(reviews.filter(review => review._id !== reviewId))
    } catch (error) {
      console.error("Delete review error:", error)
      alert("Không thể xóa đánh giá. Vui lòng thử lại sau.")
    }
  }

  // Handle like review
  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thích đánh giá")
      return
    }
    
    try {
      const result = await likeReview(reviewId)
      
      // Update reviews state with new like count
      setReviews(reviews.map(review => {
        if (review._id === reviewId) {
          return {
            ...review,
            likes: result.data.likes,
            likedByCurrentUser: result.data.alreadyLiked
          }
        }
        return review
      }))
    } catch (error) {
      console.error("Like review error:", error)
      alert("Không thể thích đánh giá. Vui lòng thử lại sau.")
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin phim...</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <p className="error-message">{error || "Không tìm thấy phim"}</p>
        <Link to="/movies" className="btn btn-primary">
          Quay lại danh sách phim
        </Link>
      </div>
    )
  }

  return (
    <div className="movie-detail-page">
      {/* Hero Section */}
      <div
        className="movie-hero"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), 
                          url(${movie.posterUrl || "https://via.placeholder.com/1200x600?text=No+Image"})`,
        }}
      >
        <div className="container">
          <Link to="/movies" className="back-link">
            ← Quay lại danh sách phim
          </Link>
          <div className="movie-hero-content">
            <div className="movie-genres">
              {movie.genre.map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              {movie.rating && (
                <span className="movie-rating">
                  <span className="star">★</span> {movie.rating}/5
                </span>
              )}
              <span className="movie-duration">{movie.duration} phút</span>
              <span className="movie-release">{new Date(movie.releaseDate).toLocaleDateString()}</span>
            </div>
            <div className="movie-actions">
              <Link to={`/movies/${id}/booking`} className="btn btn-primary">
                Đặt vé
              </Link>
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Xem trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="movie-content">
        <div className="container">
          <div className="movie-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Tổng quan
            </button>
            <button className={`tab-btn ${activeTab === "cast" ? "active" : ""}`} onClick={() => setActiveTab("cast")}>
              Diễn viên & Đoàn phim
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="movie-details-grid">
                  <div className="movie-synopsis">
                    <h2 className="section-title">Nội dung phim</h2>
                    <p className="movie-description">{movie.description}</p>

                    <h2 className="section-title mt-lg">Chi tiết</h2>
                    <div className="movie-details-list">
                      <div className="detail-item">
                        <span className="detail-label">Đạo diễn:</span>
                        <span className="detail-value">{movie.director}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Thể loại:</span>
                        <span className="detail-value">{movie.genre.join(", ")}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Thời lượng:</span>
                        <span className="detail-value">{movie.duration} phút</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ngày phát hành:</span>
                        <span className="detail-value">{new Date(movie.releaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="movie-sidebar">
                    <div className="rating-card">
                      <h3 className="card-title">Đánh giá</h3>
                      <div className="rating-display">
                        <div className="rating-number">{movie.rating || "N/A"}</div>
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= Math.round(movie.rating || 0) ? "filled" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                          <p className="rating-count">Dựa trên đánh giá của người xem</p>
                        </div>
                      </div>
                    </div>

                    <Link to={`/movies/${id}/booking`} className="btn btn-primary book-btn">
                      Đặt vé
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cast" && (
              <div className="cast-tab">
                <h2 className="section-title">Diễn viên & Đoàn phim</h2>
                <div className="cast-grid">
                  {movie.cast.map((person, index) => (
                    <div key={index} className="cast-card">
                      <div className="cast-image">
                        <img
                          src={`https://via.placeholder.com/150x150?text=${encodeURIComponent(person)}`}
                          alt={person}
                        />
                      </div>
                      <h3 className="cast-name">{person}</h3>
                      <p className="cast-role">Diễn viên</p>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <h2 className="section-title">Đạo diễn</h2>
                <div className="director-info">
                  <div className="director-image">
                    <img
                      src={`https://via.placeholder.com/150x150?text=${encodeURIComponent(movie.director)}`}
                      alt={movie.director}
                    />
                  </div>
                  <div className="director-details">
                    <h3 className="director-name">{movie.director}</h3>
                    <p className="director-role">Đạo diễn</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-tab">
                <div className="reviews-header">
                  <h2 className="section-title">Đánh giá</h2>
                  {isAuthenticated && !showReviewForm && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (userReview) {
                          handleEditReview(userReview)
                        } else {
                          setShowReviewForm(true)
                          setEditingReview(null)
                          setReviewFormData({ rating: 5, comment: "" })
                        }
                      }}
                    >
                      {userReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
                    </button>
                  )}
                  {!isAuthenticated && (
                    <Link to="/login" className="btn btn-primary">Đăng nhập để đánh giá</Link>
                  )}
                </div>

                {showReviewForm && (
                  <div className="review-form-container">
                    <h3>{editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}</h3>
                    <form className="review-form" onSubmit={handleReviewSubmit}>
                      <div className="rating-select">
                        <p>Đánh giá của bạn:</p>
                        <div className="star-rating">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <label key={star}>
                              <input
                                type="radio"
                                name="rating"
                                value={star}
                                checked={reviewFormData.rating === star}
                                onChange={handleReviewChange}
                              />
                              <span className={`star ${star <= reviewFormData.rating ? "filled" : ""}`}>★</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="comment">Nội dung đánh giá:</label>
                        <textarea
                          id="comment"
                          name="comment"
                          className="review-textarea"
                          placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim..."
                          value={reviewFormData.comment}
                          onChange={handleReviewChange}
                          required
                        ></textarea>
                      </div>
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowReviewForm(false)
                            setEditingReview(null)
                          }}
                        >
                          Hủy
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={submitLoading}
                        >
                          {submitLoading ? "Đang gửi..." : (editingReview ? "Cập nhật" : "Gửi đánh giá")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải đánh giá...</p>
                  </div>
                ) : reviewsError ? (
                  <div className="error-message">{reviewsError}</div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews">
                    <p>Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-card">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.user && review.user.name 
                                ? review.user.name.charAt(0).toUpperCase() 
                                : "U"}
                            </div>
                            <div className="reviewer-details">
                              <h4 className="reviewer-name">
                                {review.user ? review.user.name : "Ẩn danh"}
                              </h4>
                              <div className="review-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span 
                                    key={star} 
                                    className={`star ${star <= review.rating ? "filled" : ""}`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          {isAuthenticated && currentUser && review.user && 
                            currentUser._id === review.user._id && (
                            <div className="review-actions-dropdown">
                              <button className="dropdown-toggle">⋮</button>
                              <div className="dropdown-menu">
                                <button onClick={() => handleEditReview(review)}>Chỉnh sửa</button>
                                <button onClick={() => handleDeleteReview(review._id)}>Xóa</button>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="review-content">{review.comment}</p>
                        <div className="review-actions">
                          <button 
                            className={`review-action-btn ${review.likedByCurrentUser ? 'liked' : ''}`}
                            onClick={() => handleLikeReview(review._id)}
                          >
                            <span className="action-icon">👍</span> {review.likes || 0}
                          </button>
                          <button className="review-action-btn">
                            <span className="action-icon">💬</span> Trả lời
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailPage
