# Guard Attendance Management System - Backend API

A comprehensive backend API for managing guard attendance with geofencing, real-time tracking, and emergency alerts.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 📍 **Geofencing**: GPS-based attendance verification with configurable radius
- 📸 **Selfie Verification**: Cloudinary integration for photo verification
- 🚨 **Emergency Alerts**: Panic button with real-time push notifications
- 📊 **Attendance Tracking**: Check-in/out with late detection and early checkout tracking
- 👥 **User Management**: Complete CRUD operations for guards, supervisors, and admins
- 📅 **Shift Management**: Flexible shift scheduling with guard assignments
- 📝 **Audit Logging**: Comprehensive activity logging for compliance
- 🔔 **Push Notifications**: Firebase Cloud Messaging integration
- 🛡️ **Security**: Helmet, CORS, rate limiting, input validation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Upload**: Cloudinary
- **Push Notifications**: Firebase Admin SDK
- **Security**: Helmet, CORS, express-rate-limit
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Cloudinary account (for image uploads)
- Firebase project (for push notifications)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd guard/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Database
MONGODB_URI=mongodb://localhost:27017/guard-attendance

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Build the project**
```bash
npm run build
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Attendance
- `POST /api/attendance/check-in` - Check in with geofencing and selfie
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my-attendance` - Get my attendance records
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance` - Get all attendance (admin/supervisor)
- `GET /api/attendance/stats` - Get attendance statistics (admin/supervisor)

### Locations
- `POST /api/locations` - Create duty location (admin/supervisor)
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `PUT /api/locations/:id` - Update location (admin/supervisor)
- `DELETE /api/locations/:id` - Delete location (admin)

### Shifts
- `POST /api/shifts` - Create shift (admin/supervisor)
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/:id` - Get shift by ID
- `PUT /api/shifts/:id` - Update shift (admin/supervisor)
- `DELETE /api/shifts/:id` - Delete shift (admin)
- `GET /api/shifts/guard/:guardId` - Get shifts by guard

### Users
- `POST /api/users` - Create user (admin)
- `GET /api/users` - Get all users (admin/supervisor)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Deactivate user (admin)
- `POST /api/users/assign-location` - Assign location to user (admin)
- `GET /api/users/location/:locationId/guards` - Get guards by location (admin/supervisor)

### Emergency
- `POST /api/emergency` - Create emergency alert (any authenticated user)
- `GET /api/emergency` - Get all emergency alerts (admin/supervisor)
- `GET /api/emergency/active` - Get active emergency alerts (admin/supervisor)
- `PUT /api/emergency/:id` - Update emergency alert (admin/supervisor)

### Audit Logs
- `GET /api/audit` - Get all audit logs (admin)
- `GET /api/audit/user/:userId` - Get audit logs by user (admin)

## User Roles

- **Guard**: Can check in/out, view own attendance, create emergency alerts
- **Supervisor**: All guard permissions + view all attendance, manage locations and shifts
- **Admin**: All permissions + user management, audit logs

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── cloudinary.ts
│   │   ├── config.ts
│   │   ├── database.ts
│   │   └── firebase.ts
│   ├── controllers/     # Route controllers
│   │   ├── attendanceController.ts
│   │   ├── auditController.ts
│   │   ├── authController.ts
│   │   ├── emergencyController.ts
│   │   ├── locationController.ts
│   │   ├── shiftController.ts
│   │   └── userController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── models/          # Mongoose models
│   │   ├── Attendance.ts
│   │   ├── AuditLog.ts
│   │   ├── DutyLocation.ts
│   │   ├── EmergencyAlert.ts
│   │   ├── Shift.ts
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   ├── attendanceRoutes.ts
│   │   ├── auditRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── emergencyRoutes.ts
│   │   ├── locationRoutes.ts
│   │   ├── shiftRoutes.ts
│   │   └── userRoutes.ts
│   ├── utils/           # Utility functions
│   │   ├── geolocation.ts
│   │   └── jwt.ts
│   └── server.ts        # Main application entry point
├── dist/                # Compiled JavaScript (gitignored)
├── node_modules/        # Dependencies (gitignored)
├── .env                 # Environment variables (gitignored)
├── .env.example         # Example environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Building for Production
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Type Checking
```bash
npx tsc --noEmit
```

## Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT secrets** - Generate random, long strings for production
3. **Enable HTTPS** - Always use HTTPS in production
4. **Configure CORS properly** - Set specific origins instead of `*` in production
5. **Monitor rate limits** - Adjust based on your traffic patterns
6. **Regular security updates** - Keep dependencies up to date
7. **Use environment-specific configs** - Different settings for dev/staging/prod
8. **Implement password reset** - Add email-based password reset for production
9. **Add account lockout** - Prevent brute force attacks
10. **Monitor audit logs** - Regularly review for suspicious activity

## Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests with coverage (to be implemented)
npm run test:coverage
```

## Deployment

### Using Docker (Recommended)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name guard-api

# View logs
pm2 logs guard-api

# Restart
pm2 restart guard-api
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Verify network connectivity

### Firebase Push Notifications Not Working
- Verify Firebase credentials in `.env`
- Check FCM token is being saved correctly
- Ensure device has proper permissions

### Cloudinary Upload Failures
- Verify Cloudinary credentials
- Check image size (should be under 10MB)
- Ensure base64 format is correct

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please open an issue on GitHub.
