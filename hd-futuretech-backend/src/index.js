const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Import routes
const movieRoutes = require("./routes/movieRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Config
dotenv.config();
const app = express();
const port = process.env.PORT || 8769;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/cinetix")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Re-route review routes for nested URL pattern
app.use("/api/movies/:movieId/reviews", reviewRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("CineTix API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: process.env.NODE_ENV === "development" ? err.toString() : undefined,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});