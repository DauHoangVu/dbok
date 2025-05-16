const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");
const User = require("../models/User");

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/cinetix")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Sample data
const sampleMovies = [{
        title: "Avengers: Endgame",
        description: "After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
        duration: 181,
        releaseDate: "2019-04-26",
        posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
        genre: ["Action", "Adventure", "Sci-Fi"],
        director: "Anthony Russo, Joe Russo",
        cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
        rating: 4.8,
        isShowing: true
    },
    {
        title: "Parasite",
        description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        duration: 132,
        releaseDate: "2019-10-11",
        posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=SEUXfv87Wpk",
        genre: ["Comedy", "Drama", "Thriller"],
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik", "Park So-dam"],
        rating: 4.7,
        isShowing: true
    },
    {
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        duration: 142,
        releaseDate: "1994-10-14",
        posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
        genre: ["Drama"],
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler", "Clancy Brown"],
        rating: 4.9,
        isShowing: true
    },
    {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        duration: 169,
        releaseDate: "2014-11-07",
        posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        genre: ["Adventure", "Drama", "Sci-Fi"],
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
        rating: 4.6,
        isShowing: true
    },
];

const sampleCinemas = [{
        name: "CineStar Quận 1",
        location: {
            address: "271 Nguyễn Trãi, Phường Nguyễn Cư Trinh",
            city: "Hồ Chí Minh",
            district: "Quận 1",
        },
        screens: [{
                name: "Screen 1",
                totalSeats: 120,
                seatingLayout: {
                    rows: 10,
                    columns: 12,
                },
            },
            {
                name: "Screen 2",
                totalSeats: 96,
                seatingLayout: {
                    rows: 8,
                    columns: 12,
                },
            },
        ],
        facilities: ["Parking", "Food Court", "VIP Lounge"],
        isActive: true,
    },
    {
        name: "CineStar Quận 7",
        location: {
            address: "Lô B, Khu Đô Thị Sala, 10 Mai Chí Thọ",
            city: "Hồ Chí Minh",
            district: "Quận 7",
        },
        screens: [{
                name: "Screen 1",
                totalSeats: 144,
                seatingLayout: {
                    rows: 12,
                    columns: 12,
                },
            },
            {
                name: "Screen 2",
                totalSeats: 108,
                seatingLayout: {
                    rows: 9,
                    columns: 12,
                },
            },
        ],
        facilities: ["Parking", "Food Court", "IMAX"],
        isActive: true,
    },
];

const adminUser = {
    name: "Admin User",
    email: "admin@cinetix.com",
    phone: "0123456789",
    password: "password123",
    role: "admin",
};

// Import data into DB
const importData = async() => {
    try {
        // Clear existing data
        await Movie.deleteMany();
        await Cinema.deleteMany();

        // Create admin user if not exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (!existingAdmin) {
            await User.create(adminUser);
            console.log("Admin user created");
        }

        // Insert sample movies
        await Movie.insertMany(sampleMovies);
        console.log("Movies data imported");

        // Insert sample cinemas
        await Cinema.insertMany(sampleCinemas);
        console.log("Cinemas data imported");

        console.log("Data import complete!");
        process.exit();
    } catch (err) {
        console.error("Data import failed:", err);
        process.exit(1);
    }
};

// Delete all data from DB
const deleteData = async() => {
    try {
        await Movie.deleteMany();
        await Cinema.deleteMany();
        // Don't delete users

        console.log("Data deleted!");
        process.exit();
    } catch (err) {
        console.error("Data deletion failed:", err);
        process.exit(1);
    }
};

// Process command line arguments
if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
} else {
    console.log("Please use correct option: -i to import, -d to delete");
    process.exit();
}
module.exports = { importData, deleteData };