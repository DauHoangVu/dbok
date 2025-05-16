const Movie = require("../models/Movie");

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async(req, res, next) => {
    try {
        // Extract query parameters
        const { title, genre, director, sort = "-createdAt" } = req.query;

        // Build query
        const query = {};

        if (title) {
            query.title = { $regex: title, $options: "i" };
        }

        if (genre) {
            query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
        }

        if (director) {
            query.director = { $regex: director, $options: "i" };
        }

        // Execute query
        const movies = await Movie.find(query).sort(sort);

        res.status(200).json(movies);
    } catch (err) {
        next(err);
    }
};

// @desc    Get showing movies
// @route   GET /api/movies/showing
// @access  Public
exports.getShowingMovies = async(req, res, next) => {
    try {
        const movies = await Movie.find({ isShowing: true }).sort("-releaseDate");

        res.status(200).json(movies);
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async(req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        res.status(200).json(movie);
    } catch (err) {
        next(err);
    }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async(req, res, next) => {
    try {
        const movie = await Movie.create(req.body);

        res.status(201).json({
            success: true,
            message: "Movie created successfully",
            data: movie,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async(req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Movie updated successfully",
            data: movie,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async(req, res, next) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Movie deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
exports.searchMovies = async(req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Please provide a search query",
            });
        }

        const movies = await Movie.find({
            $text: { $search: q },
        }).sort({ score: { $meta: "textScore" } });

        res.status(200).json(movies);
    } catch (err) {
        next(err);
    }
};