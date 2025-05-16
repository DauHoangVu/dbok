# CineTix Backend API

Backend API for CineTix movie ticket booking application built with Node.js, Express, and MongoDB.

## Requirements

- Node.js 14+
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=8769
   MONGODB_URI=mongodb://localhost:27017/cinetix
   JWT_SECRET=your_jwt_super_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

## Running the Application

### Development mode
```
npm run dev
```

### Production mode
```
npm start
```

## Seeding Data

To populate the database with sample data:
```
node src/utils/seeder.js -i
```

To delete all sample data:
```
node src/utils/seeder.js -d
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PUT /api/users/preferences` - Update user preferences (requires auth)

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/showing` - Get currently showing movies
- `GET /api/movies/:id` - Get a specific movie
- `GET /api/movies/search` - Search movies
- `POST /api/movies` - Create a movie (admin only)
- `PUT /api/movies/:id` - Update a movie (admin only)
- `DELETE /api/movies/:id` - Delete a movie (admin only)

### Cinemas
- `GET /api/cinemas` - Get all cinemas
- `GET /api/cinemas/:id` - Get a specific cinema
- `GET /api/cinemas/city/:city` - Get cinemas by city
- `POST /api/cinemas` - Create a cinema (admin only)
- `PUT /api/cinemas/:id` - Update a cinema (admin only)
- `DELETE /api/cinemas/:id` - Delete a cinema (admin only)

### Bookings
- `POST /api/bookings` - Create a booking (requires auth)
- `GET /api/bookings` - Get user's bookings (requires auth)
- `GET /api/bookings/:id` - Get a specific booking (requires auth)
- `PUT /api/bookings/:id` - Update booking status (requires auth)
- `PUT /api/bookings/:id/payment` - Update payment status (admin only)
- `POST /api/bookings/check-seats` - Check seat availability

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header for protected routes:
```
Authorization: Bearer your_token_here
```

## Error Handling

All errors return a JSON response with:
- `success: false`
- `message`: Error message
- `error`: Detailed error (only in development mode) 