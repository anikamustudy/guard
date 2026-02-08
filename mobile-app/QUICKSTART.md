# Quick Start Guide - Guard Attendance Mobile App

## 🚀 Getting Started (5 minutes)

### Step 1: Install Dependencies
```bash
cd mobile-app
npm install
```

### Step 2: Configure Environment
```bash
# Create .env file from example
cp .env.example .env

# Edit .env with your backend URL
# API_URL=http://YOUR_BACKEND_URL/api
```

### Step 3: Start Development Server
```bash
npm start
```

### Step 4: Run on Device
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal  
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Testing the App

### 1. Create Test Account
First, ensure your backend is running, then use the registration screen or create an account directly in the backend.

**Test Credentials**:
```
Email: guard@test.com
Password: Test123!
```

### 2. Test Check-In Flow

**Requirements**:
- Location permission enabled
- Camera permission enabled
- A shift scheduled for today (create via admin panel)

**Steps**:
1. Login to the app
2. Dashboard will show today's shift
3. Tap "CHECK IN" button
4. Allow location permission when prompted
5. Move to within 100m of shift location (or adjust GEOFENCE_RADIUS in .env for testing)
6. Allow camera permission when prompted
7. Take a selfie
8. Review and submit

**Testing Tips**:
- Use Android Studio's emulator extended controls to set custom GPS coordinates
- In iOS Simulator: Debug → Location → Custom Location
- For testing, set GEOFENCE_RADIUS=10000 in .env to bypass location requirement

### 3. Test Emergency Alert

**Steps**:
1. From Dashboard, tap the Emergency quick action
2. Press the large red PANIC button
3. Confirm the alert
4. Check backend logs for alert notification

### 4. Test Attendance History

**Steps**:
1. Navigate to History tab
2. Pull down to refresh
3. Tap on any attendance record
4. View details including selfies

## 🔧 Common Development Tasks

### View Logs
```bash
# In a new terminal
npx react-native log-ios    # For iOS
npx react-native log-android # For Android
```

### Clear Cache
```bash
npm start -- --clear
```

### Reset Expo Go App
On device: Shake device → Clear app data

## 🐛 Troubleshooting

### "Network Request Failed"
- Ensure backend is running
- Check API_URL in .env
- For physical device, use your computer's IP instead of localhost
- Example: `API_URL=http://192.168.1.100:3000/api`

### Camera/Location Not Working
- Ensure permissions are granted in device settings
- Restart app after granting permissions
- Use physical device (emulators have limitations)

### TypeScript Errors
```bash
# Check for errors
npx tsc --noEmit

# If issues persist
rm -rf node_modules package-lock.json
npm install
```

### App Won't Start
```bash
# Clear watchman
watchman watch-del-all

# Clear metro bundler cache
npm start -- --reset-cache
```

## 📋 Development Checklist

Before committing changes:
- [ ] Run `npx tsc --noEmit` - No TypeScript errors
- [ ] Test on iOS (if available)
- [ ] Test on Android
- [ ] Test all main user flows
- [ ] Check console for errors/warnings
- [ ] Update README if adding new features

## 🎯 Key Features to Test

- [ ] Login/Logout
- [ ] Dashboard loads today's shift
- [ ] Check-in with GPS and selfie
- [ ] Check-out with selfie
- [ ] Attendance history pagination
- [ ] Shift list and details
- [ ] Emergency panic button
- [ ] Push notifications (requires standalone build)
- [ ] Dark mode switching
- [ ] Pull-to-refresh

## 🚢 Building for Production

### Prerequisites
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login
```

### Build iOS
```bash
eas build --platform ios
```

### Build Android
```bash
eas build --platform android
```

### Submit to Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)

## 💡 Pro Tips

1. **Faster Development**: Use physical device over emulator for location/camera features
2. **Network Debugging**: Use React Native Debugger or Flipper
3. **State Management**: Use React DevTools to inspect component state
4. **Performance**: Use Expo's performance monitoring
5. **Testing**: Consider Detox for E2E testing

## 🆘 Getting Help

1. Check the README.md
2. Review the backend API documentation
3. Check Expo documentation
4. Search React Native issues on GitHub
5. Contact the development team

---

**Happy Coding! 🎉**
