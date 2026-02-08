# Deployment Guide

This guide covers deploying the Guard Attendance Management System to production.

## Overview

The system consists of three components:
1. **Backend API** - Node.js server
2. **Admin Web Panel** - Static React app
3. **Mobile App** - React Native app distributed via app stores

## Prerequisites

Before deploying, ensure you have:
- [ ] MongoDB database (MongoDB Atlas recommended)
- [ ] Cloudinary account and API credentials
- [ ] Firebase project with Cloud Messaging enabled
- [ ] Google Maps API key
- [ ] Domain names (for backend and admin panel)
- [ ] SSL certificates (Let's Encrypt or cloud provider)

## 1. Backend API Deployment

### Option A: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
cd backend
heroku create your-app-name-api

# Add MongoDB (optional if using MongoDB Atlas)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set JWT_ACCESS_SECRET=your-strong-secret-here
heroku config:set JWT_REFRESH_SECRET=your-strong-refresh-secret-here
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloudinary-name
heroku config:set CLOUDINARY_API_KEY=your-cloudinary-key
heroku config:set CLOUDINARY_API_SECRET=your-cloudinary-secret
heroku config:set FIREBASE_PROJECT_ID=your-firebase-project-id
heroku config:set FIREBASE_PRIVATE_KEY="your-firebase-private-key"
heroku config:set FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Deploy
git push heroku main

# Run database seed (first time only)
heroku run npm run seed

# Check logs
heroku logs --tail
```

### Option B: DigitalOcean App Platform

1. Create a new app on DigitalOcean
2. Connect your GitHub repository
3. Select the `backend` folder as the source
4. Configure build command: `npm install && npm run build`
5. Configure run command: `npm start`
6. Add environment variables in the UI
7. Deploy

### Option C: AWS EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-username/guard.git
cd guard/backend

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name guard-api

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Setup Nginx as reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/guard-api

# Nginx configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/guard-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Environment Variables Checklist

```env
# Required
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/guard
JWT_ACCESS_SECRET=min-32-character-random-string
JWT_REFRESH_SECRET=different-32-character-random-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# Optional
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 2. Admin Web Panel Deployment

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd admin-panel
vercel

# Set environment variables in Vercel dashboard:
# - VITE_API_URL=https://your-api-domain.com/api
# - VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Deploy to production
vercel --prod
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the app
cd admin-panel
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Option C: AWS S3 + CloudFront

```bash
# Build the app
cd admin-panel
npm run build

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront distribution
# - Origin: S3 bucket
# - Enable HTTPS
# - Configure custom domain
# - Set default root object: index.html
# - Add error page: 404 -> /index.html (for React Router)
```

### Configuration

Create production `.env`:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 3. Mobile App Deployment

### Setup EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
cd mobile-app
eas build:configure
```

### Configure app.json

```json
{
  "expo": {
    "name": "Guard Attendance",
    "slug": "guard-attendance",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.guardattendance",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to verify attendance at your duty location.",
        "NSCameraUsageDescription": "We need camera access to capture your selfie for attendance verification."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.guardattendance",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Create eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Configure Environment Variables

Create `.env.production`:
```env
API_URL=https://api.yourdomain.com/api
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Build for Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Google Play
eas build --platform android --profile production
```

### Build for iOS

```bash
# Note: Requires Apple Developer account ($99/year)

# Build for TestFlight
eas build --platform ios --profile production

# Or build for both platforms
eas build --platform all --profile production
```

### Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

### Over-The-Air (OTA) Updates

```bash
# Publish updates without rebuilding
eas update --branch production --message "Bug fixes"

# Users will get updates automatically
```

## 4. Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create a new cluster
3. Configure network access (add your server IPs)
4. Create database user
5. Get connection string
6. Update backend MONGODB_URI

## 5. Cloudinary Setup

1. Sign up at cloudinary.com
2. Get your credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Configure upload presets (optional):
   - Folder: `guard-attendance`
   - Format: auto
   - Quality: auto
4. Update backend environment variables

## 6. Firebase Setup

### Create Firebase Project

1. Go to firebase.google.com
2. Create new project
3. Enable Cloud Messaging

### Get Service Account Credentials

1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract from JSON:
   - project_id
   - private_key
   - client_email
5. Add to backend environment variables

### Configure Mobile App

1. In Firebase Console, add iOS app
2. Download GoogleService-Info.plist
3. Add Android app
4. Download google-services.json
5. Configure in app.json:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## 7. Google Maps Setup

1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API (for web)
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create API key
5. Restrict API key:
   - For web: HTTP referrers (your domain)
   - For mobile: Application restrictions
6. Add to environment variables

## 8. SSL/TLS Configuration

### Let's Encrypt (Free)

```bash
# For backend on your own server
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloud Provider SSL

Most cloud providers (Vercel, Netlify, Heroku) provide automatic SSL.

## 9. Monitoring & Logging

### Backend Monitoring

Option A: PM2 with PM2 Plus
```bash
pm2 plus
pm2 link your-secret-key your-public-key
```

Option B: New Relic
```bash
npm install newrelic
# Configure newrelic.js
```

### Error Tracking

Setup Sentry:
```bash
npm install @sentry/node

# In server.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

## 10. Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure MongoDB network access
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable MongoDB authentication
- [ ] Keep dependencies updated
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Test rate limiting
- [ ] Verify authentication flows
- [ ] Test with malicious inputs

## 11. Performance Optimization

### Backend
- Enable gzip compression
- Use MongoDB indexes
- Implement caching (Redis optional)
- Optimize database queries
- Monitor query performance

### Frontend
- Enable code splitting
- Optimize images
- Use lazy loading
- Minimize bundle size
- Enable CDN

### Mobile
- Optimize images
- Reduce API calls
- Cache responses
- Minimize app size

## 12. Backup Strategy

### Database Backups

MongoDB Atlas:
- Automatic backups enabled by default
- Point-in-time recovery available
- Download backups regularly

Manual backups:
```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/guard"

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/guard" dump/
```

### Code Backups
- Use Git for version control
- Push to GitHub regularly
- Tag releases
- Maintain separate branches (dev, staging, production)

## 13. Post-Deployment

After deployment:

1. **Test Everything**
   - User registration
   - Login/logout
   - Check-in with GPS
   - Selfie upload
   - Emergency alerts
   - Push notifications
   - All CRUD operations

2. **Run Seed Script**
   ```bash
   # On Heroku
   heroku run npm run seed
   
   # On your server
   npm run seed
   ```

3. **Monitor Logs**
   ```bash
   # Heroku
   heroku logs --tail
   
   # PM2
   pm2 logs
   ```

4. **Setup Monitoring**
   - Configure uptime monitoring
   - Set up error alerts
   - Monitor API response times
   - Track user activity

5. **Documentation**
   - Update README with production URLs
   - Document any custom configurations
   - Create runbook for common issues

## 14. Maintenance

Regular maintenance tasks:

### Weekly
- Check error logs
- Monitor uptime
- Review user feedback

### Monthly
- Update dependencies
- Review security advisories
- Check backup integrity
- Review audit logs
- Monitor costs

### Quarterly
- Security audit
- Performance review
- Database optimization
- Update documentation

## 15. Rollback Plan

If deployment fails:

1. **Backend**: 
   - Heroku: `heroku rollback`
   - PM2: Keep previous version, switch back
   
2. **Frontend**:
   - Vercel: Rollback to previous deployment in dashboard
   - Netlify: Rollback in deployments tab

3. **Mobile**:
   - Cannot rollback app store versions
   - Push OTA update to fix issues
   - Submit new version to stores

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check environment variables
- Verify MongoDB connection
- Check logs for errors
- Ensure port is available

**Admin panel blank page:**
- Check API URL in environment
- Verify CORS settings on backend
- Check browser console for errors

**Mobile app build fails:**
- Check app.json configuration
- Verify EAS CLI is logged in
- Ensure all dependencies are installed
- Check for syntax errors

**Push notifications not working:**
- Verify Firebase credentials
- Check FCM token registration
- Test on real device (not simulator)
- Verify notification permissions

## Support

For deployment issues:
- Check logs first
- Review this guide
- Check platform-specific documentation
- Contact cloud provider support if needed

---

**Remember:** Always test in a staging environment before deploying to production!
