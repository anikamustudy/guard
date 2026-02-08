# Guard Attendance & Duty Management System

A comprehensive, production-ready attendance and duty management system for security companies with GPS geofencing, selfie verification, real-time alerts, and role-based access control.

## 🏗️ System Architecture

This system consists of three main components:

1. **Backend API** (Node.js + Express + TypeScript + MongoDB)
2. **Admin Web Panel** (React + TypeScript + Vite + Tailwind CSS)
3. **Mobile App** (React Native + Expo + TypeScript)

## 🌟 Key Features

### For Guards (Mobile App)
- ✅ GPS-based check-in/check-out with geofencing verification
- ✅ Mandatory selfie capture for attendance
- ✅ Real-time distance calculation from duty location
- ✅ Attendance history with calendar view
- ✅ Shift schedule viewing
- ✅ Emergency panic button with GPS location
- ✅ Push notifications for shift reminders and alerts
- ✅ Dark mode support

### For Admins/Supervisors (Web Panel)
- ✅ Complete guard management (create, edit, assign)
- ✅ Duty location management with Google Maps
- ✅ Shift scheduling and assignment
- ✅ Real-time attendance monitoring
- ✅ Attendance reports with date filters and CSV export
- ✅ Live emergency alert monitoring
- ✅ Comprehensive audit logging
- ✅ Role-based access control (Admin, Supervisor)
- ✅ Responsive design with dark mode

### Backend Features
- ✅ RESTful API with TypeScript
- ✅ JWT authentication with refresh tokens
- ✅ Role-based authorization middleware
- ✅ Haversine formula for GPS distance calculation
- ✅ Cloudinary integration for image storage
- ✅ Firebase Admin SDK for push notifications
- ✅ MongoDB with Mongoose ODM
- ✅ Rate limiting and security headers
- ✅ Comprehensive audit logging
- ✅ Input validation with express-validator

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- Cloudinary account (for image uploads)
- Firebase project (for push notifications)
- Google Maps API key (for location features)
- Expo CLI (for mobile development)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if running locally)
mongod

# Run database seeding (optional)
npm run seed

# Start development server
npm run dev

# Or build and start production
npm run build
npm start
```

Backend will run on `http://localhost:5000`

**Backend Environment Variables:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/guard-attendance
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 2. Admin Web Panel Setup

```bash
cd admin-panel

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Admin panel will run on `http://localhost:5173`

**Admin Panel Environment Variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Mobile App Setup

```bash
cd mobile-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

**Mobile App Environment Variables:**
```env
API_URL=http://your-backend-url:5000/api
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📱 Mobile App Testing

For development, you can use:
- **Expo Go** app on your physical device
- iOS Simulator (requires macOS)
- Android Emulator

For production builds, use **EAS Build**:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🔐 Default Credentials

After running the seed script, you can use these test accounts:

**Admin:**
- Email: admin@guard.com
- Password: Admin@123

**Supervisor:**
- Email: supervisor@guard.com
- Password: Super@123

**Guard:**
- Email: guard1@guard.com
- Password: Guard@123

⚠️ **Change these credentials in production!**

## 📊 Database Schema

### User
- name, email, phone, role (guard/supervisor/admin)
- password (bcrypt hashed)
- assignedLocations, isActive, fcmToken

### DutyLocation
- name, latitude, longitude, radius
- address, createdBy, isActive

### Shift
- name, startTime, endTime, lateThreshold
- location, assignedGuards, daysOfWeek, isActive

### Attendance
- userId, locationId, shiftId
- checkInTime, checkOutTime, status
- selfieUrl, gpsCoordinates, distanceFromLocation

### EmergencyAlert
- userId, locationId, gpsCoordinates
- timestamp, status, resolvedBy, notes

### AuditLog
- userId, action, timestamp, metadata

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Firebase Admin SDK
- Cloudinary
- express-validator
- helmet & cors
- express-rate-limit

### Admin Web Panel
- React 19 & TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Axios
- @googlemaps/js-api-loader
- Recharts (for data visualization)
- date-fns

### Mobile App
- React Native 0.81.5
- Expo SDK 54
- TypeScript
- React Navigation 7
- expo-location
- expo-camera
- expo-notifications
- react-native-maps
- Axios

## 🔒 Security Features

1. **Authentication**
   - JWT access tokens (15 min expiry)
   - Refresh tokens (7 days expiry)
   - Secure token storage (expo-secure-store on mobile)
   - Password hashing with bcrypt (10 rounds)

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes and API endpoints
   - Middleware for role checking

3. **API Security**
   - Helmet for security headers
   - CORS configuration
   - Rate limiting (100 requests per 15 minutes)
   - Auth-specific rate limiting (5 login attempts per 15 minutes)
   - Input validation and sanitization
   - Request size limits

4. **Audit Trail**
   - All critical operations logged
   - IP address and user agent tracking
   - Detailed metadata storage

## 🗺️ Geofencing Logic

The system uses the **Haversine formula** to calculate the distance between the guard's current GPS location and the assigned duty location:

```typescript
// Check if guard is within allowed radius
const { isWithinRadius, distance } = isWithinGeofence(
  userLat,
  userLon,
  locationLat,
  locationLon,
  allowedRadius
);
```

- If `distance ≤ radius`: ✅ Check-in allowed
- If `distance > radius`: ❌ Check-in denied with distance shown

## 🔔 Push Notifications

The system uses Firebase Cloud Messaging (FCM) for real-time notifications:

### Notification Types
1. **Shift Reminders** - Before shift start time
2. **Late Warnings** - When guard checks in late
3. **Emergency Alerts** - When panic button is pressed
4. **Shift Confirmations** - Check-in/check-out confirmations

### Setup Firebase
1. Create a Firebase project
2. Enable Cloud Messaging
3. Download service account JSON
4. Extract project ID, private key, and client email
5. Add to backend `.env` file

## 📸 Selfie Verification

- Captured using device camera (no gallery access)
- Uploaded to Cloudinary
- Stored as secure URL in database
- Displayed in admin panel and attendance history
- Ensures guard physically present at location

## 🚨 Emergency/Panic Feature

When a guard presses the panic button:
1. Current GPS location captured
2. Emergency alert created in database
3. Push notifications sent to all admins/supervisors
4. Alert appears in admin dashboard with location
5. Admin can acknowledge/resolve the alert

## 📈 Reports & Analytics

Admin panel provides:
- Daily/weekly/monthly attendance reports
- Late/absent summary statistics
- Location-wise attendance
- Guard-wise performance
- Export to CSV functionality

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Attendance
- `POST /api/attendance/checkin` - Check-in
- `POST /api/attendance/checkout` - Check-out
- `GET /api/attendance/my` - Get my attendance
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance` - Get all attendance (admin)
- `GET /api/attendance/stats` - Get statistics

### Locations
- `POST /api/locations` - Create location (admin)
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `PUT /api/locations/:id` - Update location (admin)
- `DELETE /api/locations/:id` - Delete location (admin)

### Shifts
- `POST /api/shifts` - Create shift (admin)
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/:id` - Get shift by ID
- `PUT /api/shifts/:id` - Update shift (admin)
- `DELETE /api/shifts/:id` - Delete shift (admin)
- `GET /api/shifts/guard/:guardId` - Get shifts by guard

### Users/Guards
- `POST /api/users` - Create user (admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Deactivate user (admin)
- `POST /api/users/:id/assign-location` - Assign location (admin)
- `GET /api/users/location/:locationId` - Get guards by location

### Emergency Alerts
- `POST /api/emergency` - Create alert (guard)
- `GET /api/emergency` - Get all alerts (admin/supervisor)
- `GET /api/emergency/active` - Get active alerts
- `PUT /api/emergency/:id` - Update alert status

### Audit Logs
- `GET /api/audit` - Get audit logs (admin)
- `GET /api/audit/user/:userId` - Get logs by user

## 🏗️ Folder Structure

```
guard/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── admin-panel/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/          # API config
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
├── mobile-app/
│   ├── src/
│   │   ├── components/      # React Native components
│   │   ├── config/          # API config
│   │   ├── constants/       # Constants
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── navigation/      # Navigation setup
│   │   ├── screens/         # Screen components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── App.tsx              # Main app component
│   ├── app.json             # Expo configuration
│   └── package.json
└── README.md
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Run tests (if configured)
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] JWT token refresh
- [ ] Guard check-in with valid GPS
- [ ] Guard check-in outside geofence (should fail)
- [ ] Selfie upload and retrieval
- [ ] Check-out process
- [ ] Emergency alert creation and notification
- [ ] Admin can view all attendance
- [ ] Admin can manage guards
- [ ] Admin can create/edit locations
- [ ] Admin can create/edit shifts
- [ ] Push notifications work
- [ ] Audit logs are created

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
```bash
# Login to Heroku
heroku login

# Create app
heroku create guard-attendance-api

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_ACCESS_SECRET=your-secret
heroku config:set CLOUDINARY_CLOUD_NAME=your-name
# ... set all required env vars

# Deploy
git push heroku main
```

### Admin Panel Deployment (Example: Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd admin-panel
vercel
```

### Mobile App Deployment (EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
cd mobile-app
eas build:configure

# Build for production
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB connection fails:**
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`
- Verify network connectivity

**JWT token invalid:**
- Check JWT secrets are set in `.env`
- Ensure tokens haven't expired
- Clear tokens and login again

**Cloudinary upload fails:**
- Verify Cloudinary credentials
- Check image size (max 10MB)
- Ensure internet connectivity

### Admin Panel Issues

**Cannot login:**
- Check API URL in `.env`
- Verify backend is running
- Check browser console for errors

**Maps not loading:**
- Verify Google Maps API key
- Enable Maps JavaScript API in Google Cloud Console
- Check API key restrictions

### Mobile App Issues

**Camera not working:**
- Grant camera permissions
- Check `app.json` permissions
- Restart app after granting permissions

**Location not working:**
- Grant location permissions
- Enable location services on device
- For iOS: Add `NSLocationWhenInUseUsageDescription` in `app.json`

**Push notifications not working:**
- Verify Firebase configuration
- Register device token with backend
- Check notification permissions

## 📝 Best Practices

1. **Security**
   - Never commit `.env` files
   - Use strong JWT secrets (min 32 characters)
   - Rotate secrets regularly
   - Enable HTTPS in production

2. **Database**
   - Regular backups
   - Use indexes for frequently queried fields
   - Monitor query performance

3. **Mobile App**
   - Test on real devices
   - Handle offline scenarios
   - Optimize images for mobile
   - Test on both iOS and Android

4. **Code Quality**
   - Use TypeScript strictly
   - Follow ESLint rules
   - Write meaningful commit messages
   - Document complex logic

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation
3. Check environment variables
4. Verify all services are running

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

Built for production use by security companies managing guard attendance and duty assignments.

---

**Built with ❤️ using TypeScript, React, React Native, Node.js, and MongoDB**
