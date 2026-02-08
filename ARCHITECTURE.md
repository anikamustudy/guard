# System Architecture

## Overview

The Guard Attendance & Duty Management System is a full-stack application consisting of three main components:

1. **Backend API** - Node.js/Express/TypeScript server
2. **Admin Web Panel** - React/TypeScript web application
3. **Mobile App** - React Native/Expo mobile application

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ MongoDB  │  │Cloudinary│  │ Firebase │  │  Google  │   │
│  │ Database │  │  Images  │  │   FCM    │  │   Maps   │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└────────┼─────────────┼─────────────┼─────────────┼─────────┘
         │             │             │             │
         └─────────────┼─────────────┴─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │    Backend API Server     │
         │   Node.js + Express +     │
         │      TypeScript           │
         │                           │
         │  ┌────────────────────┐  │
         │  │   REST API         │  │
         │  │   JWT Auth         │  │
         │  │   Geofencing       │  │
         │  │   Notifications    │  │
         │  └────────────────────┘  │
         └─────┬──────────────┬─────┘
               │              │
       ┌───────▼──────┐  ┌───▼────────┐
       │  Admin Web   │  │  Mobile    │
       │    Panel     │  │    App     │
       │              │  │            │
       │  React +     │  │ React      │
       │  TypeScript  │  │ Native +   │
       │  + Vite      │  │ Expo       │
       │              │  │            │
       │ ┌──────────┐ │  │ ┌────────┐ │
       │ │Dashboard │ │  │ │Check-in│ │
       │ │Guards    │ │  │ │Selfie  │ │
       │ │Locations │ │  │ │GPS     │ │
       │ │Shifts    │ │  │ │Panic   │ │
       │ │Reports   │ │  │ │History │ │
       │ └──────────┘ │  │ └────────┘ │
       └──────────────┘  └────────────┘
            Admin              Guard
```

## Component Details

### 1. Backend API

**Technology Stack:**
- Node.js 18+
- Express.js 4.x
- TypeScript 5.x
- MongoDB 5.x with Mongoose
- JWT for authentication
- Firebase Admin SDK
- Cloudinary SDK

**Key Responsibilities:**
- User authentication and authorization
- Attendance management with GPS verification
- Location and shift management
- Emergency alert handling
- Push notification delivery
- Image upload management
- Audit logging
- Data validation and sanitization

**API Structure:**
```
/api
  /auth          - Authentication endpoints
  /attendance    - Attendance management
  /locations     - Duty location CRUD
  /shifts        - Shift scheduling
  /users         - User/guard management
  /emergency     - Emergency alerts
  /audit         - Audit logs
```

**Security Layers:**
1. Helmet middleware for HTTP headers
2. CORS configuration
3. Rate limiting (general + auth-specific)
4. JWT token validation
5. Role-based access control
6. Input validation with express-validator
7. Password hashing with bcrypt

### 2. Admin Web Panel

**Technology Stack:**
- React 19
- TypeScript 5.x
- Vite 7.x
- Tailwind CSS 3.x
- React Router v6
- Axios for API calls
- Google Maps JavaScript API
- Recharts for visualization

**Key Features:**
- Dashboard with real-time statistics
- Guard management (CRUD operations)
- Location management with interactive maps
- Shift scheduling and assignment
- Attendance reports with filters
- Emergency alert monitoring
- Audit log viewer
- Dark mode support
- Responsive design

**User Roles:**
- **Admin**: Full access to all features
- **Supervisor**: Read-only access to most features

**State Management:**
- React Context for authentication
- Local component state with hooks
- API service layer for data fetching

### 3. Mobile App

**Technology Stack:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.x
- React Navigation 7
- expo-location for GPS
- expo-camera for photos
- expo-notifications for FCM
- react-native-maps

**Key Features:**
- GPS-based check-in/check-out
- Real-time geofence verification
- Selfie capture for attendance
- Attendance history
- Shift viewing
- Emergency panic button
- Push notifications
- Dark mode support

**Navigation Structure:**
```
Auth Stack
  - Login
  - Register

Main Tabs
  - Dashboard
    - Today's shift
    - Check-in/out buttons
    - Location map
  - Attendance
    - History
    - Calendar view
    - Detail view
  - Shifts
    - Upcoming shifts
    - Shift details
  - Profile
    - Settings
    - Logout
```

## Data Flow

### Check-in Process

```
1. Guard opens mobile app
2. App fetches today's shift from backend
3. Guard taps "Check In" button
4. App requests GPS location permission
5. App gets high-accuracy GPS coordinates
6. App calculates distance to duty location (Haversine)
7. If outside radius:
   ❌ Show error with distance
   ❌ Block check-in
8. If inside radius:
   ✅ Open camera for selfie
   ✅ Guard captures selfie
   ✅ Preview selfie
   ✅ Confirm
9. App uploads selfie to Cloudinary (via backend)
10. Backend creates attendance record with:
    - GPS coordinates
    - Distance from location
    - Selfie URL
    - Status (present/late)
11. Backend checks if late
12. If late, send push notification
13. Backend logs action in audit table
14. App shows success message
```

### Emergency Alert Process

```
1. Guard presses panic button
2. App shows confirmation dialog
3. Guard confirms
4. App gets current GPS location
5. App sends alert to backend:
   - GPS coordinates
   - Timestamp
   - User ID
6. Backend creates EmergencyAlert record
7. Backend queries all admin/supervisor users
8. For each admin/supervisor with FCM token:
   - Send push notification via Firebase
9. Admin/supervisor receives notification
10. Admin opens web panel
11. Alert appears in dashboard
12. Admin views location on map
13. Admin acknowledges or resolves alert
14. Backend updates alert status
15. System logs all actions
```

## Database Schema

### Collections

**users**
- Authentication and profile data
- Role-based access
- Assigned locations
- FCM token for notifications

**duty_locations**
- GPS coordinates
- Geofence radius
- Address information
- Active status

**shifts**
- Time schedule
- Assigned guards
- Days of week
- Late threshold

**attendances**
- Check-in/out timestamps
- GPS coordinates
- Selfie URL
- Distance from location
- Status (present/late/absent)

**emergency_alerts**
- GPS coordinates at time of alert
- Status tracking
- Resolution information

**audit_logs**
- Action tracking
- Metadata (IP, user agent)
- Timestamp

## Security Architecture

### Authentication Flow

```
1. User enters credentials
2. Backend validates credentials
3. If valid:
   - Generate access token (15 min expiry)
   - Generate refresh token (7 days expiry)
   - Hash and store refresh token
   - Return both tokens
4. Client stores tokens securely:
   - Web: localStorage
   - Mobile: expo-secure-store
5. Every API request includes access token
6. If access token expired:
   - Use refresh token to get new access token
   - If refresh token expired, force re-login
```

### Authorization Levels

**Guard:**
- View own attendance
- Check-in/check-out
- View assigned shifts
- Trigger emergency alerts
- Update own profile

**Supervisor:**
- View all attendance
- View all guards
- View emergency alerts
- View audit logs (limited)

**Admin:**
- All supervisor permissions
- Create/edit/delete users
- Create/edit/delete locations
- Create/edit/delete shifts
- Assign shifts and locations
- View full audit logs
- Resolve emergency alerts

## Geofencing Implementation

### Haversine Formula

Used to calculate the great-circle distance between two points on Earth:

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
```

### Accuracy Considerations
- High-accuracy GPS requested on mobile
- Typical accuracy: 5-10 meters outdoors
- May be 20-50 meters indoors
- Recommended radius: 100+ meters to account for GPS variance

## Notification System

### Firebase Cloud Messaging Integration

**Backend Setup:**
1. Firebase Admin SDK initialized with service account
2. FCM tokens stored in user records
3. Notification sending function in backend

**Mobile Setup:**
1. Register for push notifications on app start
2. Get FCM token
3. Send token to backend
4. Store token securely
5. Listen for incoming notifications
6. Handle foreground/background notifications

**Notification Types:**
- Shift reminders (scheduled)
- Late check-in warnings (immediate)
- Emergency alerts (immediate, high priority)
- Check-in confirmations (immediate)

## Image Storage

### Cloudinary Integration

**Upload Flow:**
1. Mobile app captures selfie
2. Convert to base64
3. Send to backend API
4. Backend uploads to Cloudinary:
   - Folder: `guard-attendance`
   - Format: auto-optimized
   - Quality: 70%
   - Max size: 10MB
5. Get secure URL
6. Store URL in database
7. Return URL to client

**Benefits:**
- Automatic image optimization
- CDN delivery
- Secure URLs with signatures
- Transformations (resize, crop)
- No server disk storage needed

## Scalability Considerations

### Backend Scalability
- Stateless API design (no session storage)
- JWT tokens (no server-side session)
- MongoDB indexes on frequently queried fields
- Connection pooling
- Rate limiting to prevent abuse
- Async operations for I/O tasks

### Database Optimization
- Indexes on:
  - userId in attendance
  - locationId in attendance
  - createdAt in multiple collections
  - email in users (unique)
- Pagination for large datasets
- Aggregation pipelines for reports

### Frontend Optimization
- Code splitting
- Lazy loading of routes
- Image optimization
- Memoization with React hooks
- Debounced search inputs
- Virtualized lists for large data

### Mobile Optimization
- Image compression before upload
- Cached API responses
- Offline support (future enhancement)
- Background location updates (future enhancement)
- Battery optimization

## Deployment Architecture

### Recommended Setup

**Backend:**
- Cloud platform: Heroku, AWS, or DigitalOcean
- Database: MongoDB Atlas
- Environment: Production mode
- SSL/TLS: Required
- Auto-scaling: Recommended

**Admin Panel:**
- Static hosting: Vercel, Netlify, or AWS S3
- CDN: CloudFront or similar
- SSL/TLS: Automatic

**Mobile App:**
- iOS: App Store via EAS
- Android: Google Play via EAS
- OTA updates: Expo Updates

**External Services:**
- MongoDB Atlas (database)
- Cloudinary (images)
- Firebase (notifications)
- Google Maps (maps)

## Monitoring & Logging

### Backend Logging
- Winston or similar logging library
- Log levels: error, warn, info, debug
- Structured logs (JSON format)
- Log aggregation service (optional)

### Audit Trail
- All critical operations logged
- IP address tracking
- User agent tracking
- Action metadata
- Searchable and filterable

### Error Tracking
- Error boundaries in frontend
- Try-catch blocks in API
- Meaningful error messages
- Error reporting service (Sentry, etc.)

## Future Enhancements

1. **Offline Support**
   - Local database on mobile
   - Sync when online
   - Queue pending operations

2. **Advanced Analytics**
   - Machine learning for patterns
   - Predictive analytics
   - Automated reports

3. **Video Surveillance**
   - Integration with CCTV
   - Video clips on check-in
   - Incident recording

4. **Biometric Authentication**
   - Fingerprint on mobile
   - Face recognition
   - Multi-factor authentication

5. **Advanced Scheduling**
   - Automatic shift assignment
   - Conflict detection
   - Swap requests

6. **Mobile Patrol Tracking**
   - Continuous GPS tracking
   - Route verification
   - Checkpoint scanning

7. **Integration APIs**
   - Third-party HR systems
   - Payroll integration
   - Access control systems

---

This architecture is designed to be:
- **Scalable**: Can handle growing number of users
- **Secure**: Multiple layers of security
- **Maintainable**: Clean code structure
- **Reliable**: Error handling and logging
- **Flexible**: Easy to extend and modify
