import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getCinemas } from "../services/api"
import "../styles/CinemasPage.css"

const CinemasPage = () => {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCity, setSelectedCity] = useState("all")
  const [cities, setCities] = useState([])

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true)
        const data = await getCinemas()
        setCinemas(data)
        
        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(data.map((cinema) => cinema.location.city))
        ).sort()
        setCities(uniqueCities)
        
        setError(null)
      } catch (err) {
        console.error("Failed to fetch cinemas:", err)
        setError("Không thể tải danh sách rạp chiếu. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchCinemas()
  }, [])

  // Filter cinemas by selected city
  const filteredCinemas = selectedCity === "all"
    ? cinemas
    : cinemas.filter((cinema) => cinema.location.city === selectedCity)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách rạp chiếu...</p>
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
    <div className="cinemas-page">
      <div className="container">
        <h1 className="page-title">Rạp chiếu</h1>

        <div className="cinemas-filter">
          <label htmlFor="city-filter">Lọc theo thành phố:</label>
          <select
            id="city-filter"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="city-select"
          >
            <option value="all">Tất cả thành phố</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {filteredCinemas.length > 0 ? (
          <div className="cinemas-grid">
            {filteredCinemas.map((cinema) => (
              <div key={cinema._id} className="cinema-card">
                <div className="cinema-info">
                  <h2 className="cinema-name">{cinema.name}</h2>
                  <div className="cinema-location">
                    <p className="cinema-address">
                      <strong>Địa chỉ:</strong> {cinema.location.address}
                    </p>
                    <p className="cinema-district">
                      <strong>Quận/Huyện:</strong> {cinema.location.district}
                    </p>
                    <p className="cinema-city">
                      <strong>Thành phố:</strong> {cinema.location.city}
                    </p>
                  </div>
                  <div className="cinema-facilities">
                    <h3>Tiện ích:</h3>
                    <ul className="facilities-list">
                      {cinema.facilities.map((facility, index) => (
                        <li key={index} className="facility-item">
                          {facility}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="cinema-screens">
                    <h3>Phòng chiếu:</h3>
                    <ul className="screens-list">
                      {cinema.screens.map((screen, index) => (
                        <li key={index} className="screen-item">
                          {screen.name} ({screen.totalSeats} chỗ ngồi)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="cinema-actions">
                  <Link to={`/movies?cinema=${cinema._id}`} className="btn btn-primary">
                    Xem phim tại rạp này
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-cinemas">
            <p>Không tìm thấy rạp chiếu nào tại thành phố đã chọn.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CinemasPage 