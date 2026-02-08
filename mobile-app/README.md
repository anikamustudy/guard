# Guard Attendance Mobile App

A production-ready React Native mobile application for security guards to manage attendance, check-in/check-out with GPS verification and selfie capture, view shifts, and send emergency alerts.

## Features

### ✅ Core Features
- **Secure Authentication** - Login/Register with JWT tokens
- **GPS-Based Check-in/Check-out** - Geofence verification with configurable radius
- **Selfie Capture** - Mandatory selfie for attendance verification
- **Shift Management** - View scheduled and upcoming shifts
- **Attendance History** - Calendar view with detailed records
- **Emergency Panic Button** - Send instant alerts with GPS location
- **Push Notifications** - Real-time notifications for shifts and alerts
- **Dark Mode Support** - Automatic theme switching

### 🔒 Security
- Secure token storage using Expo SecureStore
- Automatic JWT token refresh
- Encrypted local data storage
- Permission-based access control

### 📱 User Experience
- Large, accessible tap targets (min 44x44)
- Clear visual hierarchy
- Intuitive navigation with bottom tabs
- Loading states and error handling
- Offline capability awareness
- Pull-to-refresh on all lists

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing push notifications and camera

## Installation

1. **Install Dependencies**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   API_URL=http://your-backend-api-url/api
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEOFENCE_RADIUS=100
   ENVIRONMENT=development
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LocationMap.tsx
│   │   ├── SelfiePreview.tsx
│   │   └── ShiftCard.tsx
│   ├── config/              # App configuration
│   │   └── api.ts           # Axios instance with interceptors
│   ├── constants/           # Constants and theme
│   │   └── colors.ts
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocation.ts
│   │   ├── useCamera.ts
│   │   └── useNotifications.ts
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/             # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Main/
│   │   │   └── DashboardScreen.tsx
│   │   ├── Attendance/
│   │   │   ├── CheckInScreen.tsx
│   │   │   ├── CheckOutScreen.tsx
│   │   │   ├── AttendanceHistoryScreen.tsx
│   │   │   └── AttendanceDetailScreen.tsx
│   │   ├── Shift/
│   │   │   ├── ShiftListScreen.tsx
│   │   │   └── ShiftDetailScreen.tsx
│   │   ├── Emergency/
│   │   │   └── PanicButtonScreen.tsx
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── Notifications/
│   │       └── NotificationsScreen.tsx
│   ├── services/            # API service layer
│   │   ├── authService.ts
│   │   ├── attendanceService.ts
│   │   ├── shiftService.ts
│   │   ├── locationService.ts
│   │   ├── emergencyService.ts
│   │   └── notificationService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── storage.ts       # Secure storage utilities
│       └── geolocation.ts   # GPS and geofencing utilities
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

## Key User Flows

### Check-in Flow
1. Guard opens app and navigates to Dashboard
2. Sees today's shift with location
3. Taps "CHECK IN" button
4. App requests and verifies GPS location
5. If within geofence, opens camera
6. Guard takes selfie
7. Reviews selfie preview
8. Submits check-in
9. Success confirmation

### Check-out Flow
1. Guard taps "CHECK OUT" button
2. Camera opens immediately
3. Guard takes selfie
4. Reviews and submits
5. GPS location captured automatically
6. Success confirmation

### Emergency Alert
1. Guard navigates to Emergency screen
2. Presses large red PANIC button
3. Confirmation dialog
4. App gets GPS location
5. Sends alert to backend
6. Backend notifies all supervisors
7. Success confirmation

## Configuration

### Permissions Required

The app requires the following permissions (configured in `app.json`):

- **Location (Foreground)** - For check-in/check-out verification
- **Camera** - For selfie capture
- **Notifications** - For push notifications

### Geofencing

Default geofence radius is 100 meters. Configure in `.env`:
```env
GEOFENCE_RADIUS=100
```

### API Integration

The app expects the following backend API endpoints:

**Authentication**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

**Attendance**
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/history`
- `GET /api/attendance/today`
- `GET /api/attendance/:id`

**Shifts**
- `GET /api/shifts/my-shifts`
- `GET /api/shifts/today`
- `GET /api/shifts/upcoming`
- `GET /api/shifts/:id`

**Emergency**
- `POST /api/emergency/alert`
- `GET /api/emergency/my-alerts`

**Notifications**
- `POST /api/notifications/register-token`
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

## Building for Production

### iOS

1. **Configure Bundle Identifier**
   ```json
   "ios": {
     "bundleIdentifier": "com.yourcompany.guardattendance"
   }
   ```

2. **Build**
   ```bash
   eas build --platform ios
   ```

### Android

1. **Configure Package Name**
   ```json
   "android": {
     "package": "com.yourcompany.guardattendance"
   }
   ```

2. **Build**
   ```bash
   eas build --platform android
   ```

## Testing

### Test Checklist
- [ ] Login/Logout functionality
- [ ] GPS permission request
- [ ] Camera permission request
- [ ] Geofence verification (inside/outside)
- [ ] Selfie capture and preview
- [ ] Check-in success
- [ ] Check-out success
- [ ] Attendance history loading
- [ ] Shift list and details
- [ ] Emergency alert sending
- [ ] Push notifications
- [ ] Dark mode switching
- [ ] Network error handling
- [ ] Token refresh on 401

### Test Accounts

Create test accounts in your backend:
```
Email: guard1@test.com
Password: Test123!
```

## Troubleshooting

### Common Issues

**Camera not working**
- Ensure camera permissions are granted
- Check `app.json` has camera configuration
- Restart app after permission change

**GPS not accurate**
- Use physical device (emulators have limited GPS)
- Enable high accuracy in device settings
- Ensure location permissions are granted

**Push notifications not received**
- Expo Go app may have limitations
- Build standalone app for full notification support
- Verify FCM configuration

**API calls failing**
- Check API_URL in `.env`
- Ensure backend is running
- Check network connectivity
- Review axios interceptor logs

## Performance Optimization

- Images optimized to 70% quality
- Lazy loading of screens
- Memoized components where appropriate
- Efficient re-renders with proper dependencies
- Background location updates disabled when not needed

## Security Considerations

- Tokens stored in SecureStore (encrypted)
- No sensitive data in AsyncStorage
- HTTPS required for production
- Token refresh before expiration
- Logout clears all local data

## Support

For issues or questions:
1. Check this README
2. Review backend API documentation
3. Check Expo documentation
4. Contact development team

## License

Proprietary - All rights reserved
