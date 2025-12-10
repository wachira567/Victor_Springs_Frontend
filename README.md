# Victor Springs Frontend

A modern, responsive React-based frontend application for the Victor Springs property rental platform. This application provides an intuitive user interface for discovering, viewing, and renting premium properties in Nairobi.

## Project Overview

Victor Springs is a comprehensive property rental platform that connects tenants with premium rental properties in Nairobi. The frontend application handles user interactions, authentication, property browsing, viewing requests, and administrative functions.

## Live Deployment

- **Frontend Application:** https://venue-vibe-frontend-git-main-washiras-projects-fb5072e5.vercel.app
- **Backend API:** https://venuevibe-backend.onrender.com/

## Repository Links

- **Frontend Repository:** https://github.com/wachira567/VenueVibe_Frontend
- **Backend Repository:** https://github.com/wachira567/VenueVibe_Backend

## Features

### User Features

- **Property Discovery:** Browse and search properties by location, type, and price range
- **User Authentication:** Secure login and registration with email/password and Google OAuth
- **Property Viewing:** Schedule property viewings with real-time availability
- **Saved Properties:** Save favorite properties for quick access
- **Viewing Management:** View viewing history and track viewing status
- **Profile Management:** Update user information and preferences
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices

### Administrative Features

- **Dashboard Overview:** Revenue tracking, booking statistics, and user metrics
- **Booking Management:** Approve/reject bookings, update payment status
- **User Management:** View and manage user accounts
- **Venue Management:** Add, edit, and remove venues
- **Real-time Reports:** Charts and analytics for business insights

## Technology Stack

### Core Framework

- **React 18:** Modern React with hooks and functional components for building the user interface
- **Vite:** Fast build tool and development server for optimized development experience

### Styling and UI

- **Tailwind CSS:** Utility-first CSS framework for responsive and consistent styling
- **Custom CSS:** Component-specific styles for complex layouts and animations

### Routing and State Management

- **React Router:** Client-side routing for navigation between different application sections
- **React Context:** Global state management for authentication and user data

### HTTP Client

- **Axios:** Promise-based HTTP client for API communication with request/response interceptors

### Development Tools

- **ESLint:** Code linting for maintaining code quality
- **PostCSS:** CSS processing with Autoprefixer for cross-browser compatibility

## Project Structure

```
src/
├── api/
│   └── axios.js              # API client configuration
├── assets/
│   └── react.svg            # Static assets
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── Navbar.jsx           # Navigation component
│   ├── Footer.jsx           # Footer component
│   ├── ProtectedRoute.jsx   # Route protection
│   └── ProfileEditModal.jsx # Profile editing modal
├── context/
│   └── AuthContext.jsx      # Authentication context
├── pages/
│   ├── public/              # Public pages (Home, Login, Register, etc.)
│   ├── client/              # Client dashboard pages
│   └── admin/               # Admin dashboard pages
├── utils/
│   └── utils.js             # Utility functions
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css                # Global styles
```

## Key Components and Their Purpose

### Authentication System

- **AuthContext:** Manages user authentication state across the application
- **ProtectedRoute:** Guards routes that require authentication
- **Google OAuth Integration:** Seamless social login functionality

### Venue Management

- **Venue Listing:** Displays venues with filtering and search capabilities
- **Venue Details:** Comprehensive venue information with booking options
- **Saved Venues:** User-specific venue collections

### Booking System

- **Booking Form:** Multi-step booking process with validation
- **Booking History:** User's past and current bookings
- **Invoice Generation:** PDF download functionality

### Administrative Interface

- **AdminDashboard:** Comprehensive admin control panel
- **Data Visualization:** Charts for analytics and reporting
- **CRUD Operations:** Full management of users, venues, and bookings

## API Integration

The frontend communicates with the backend API through RESTful endpoints:

- **Authentication:** `/token`, `/login/google`, `/auth/google`
- **Users:** `/users`, `/users/me`, `/users/profile`
- **Venues:** `/venues`, `/venues/{id}`, `/venues/saved`
- **Bookings:** `/bookings`, `/bookings/my-bookings`, `/bookings/{id}/invoice`
- **Admin:** `/admin/*` endpoints for administrative functions

## Environment Configuration

The application uses environment variables for configuration:

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch. The build process uses Vite for optimized production bundles.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization with Cloudinary
- CSS optimization with Tailwind purging
- Bundle analysis and tree shaking

## Security Considerations

- JWT token-based authentication
- Protected routes and API endpoints
- Input validation and sanitization
- HTTPS enforcement in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request with detailed description

## License

This project is proprietary software. All rights reserved.

## Contact

For technical support or inquiries, please use the contact form on the live application or reach out through the repository issues.
