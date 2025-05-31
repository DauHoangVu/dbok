const express = require("express");
const router = express.Router();
const {
    getMovies,
    getShowingMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
} = require("../controllers/movieController");
const { protect, authorize } = require("../middleware/auth");

// Include review router
const reviewRouter = require("./reviewRoutes");

// Re-route into other resource routers
router.use("/:movieId/reviews", reviewRouter);

// Public routes
router.get("/", getMovies);
router.get("/showing", getShowingMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovie);

// Admin routes - protected with authentication and authorization
router.post("/", createMovie);
router.put("/:id", updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;