import { Link } from "react-router-dom"
import "../styles/MovieCard.css"

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <Link to={`/movies/${movie._id}`} className="movie-card-link">
        <div className="movie-card-image">
          <img
            src={movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Image"}
            alt={movie.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x450?text=No+Image"
            }}
          />
          {movie.rating && (
            <div className="movie-rating">
              <span className="star">★</span> {movie.rating}
            </div>
          )}
        </div>
        <div className="movie-card-content">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-genres">{movie.genre.join(", ")}</p>
        </div>
      </Link>
    </div>
  )
}

export default MovieCard
