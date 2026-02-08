# Guard Attendance Management System - Admin Panel

A modern, responsive admin web panel for managing guard attendance, built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Real-time statistics and charts for attendance monitoring
- **Guards Management**: CRUD operations for guard profiles
- **Locations**: Manage locations with Google Maps integration
- **Shifts**: Schedule and manage guard shifts
- **Attendance**: Track check-ins/check-outs with GPS and selfie verification
- **Emergency Alerts**: Real-time emergency monitoring with live map
- **Audit Logs**: Complete audit trail for all system actions
- **Role-Based Access**: Admin and Supervisor roles with different permissions
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API Client
- **Recharts** - Data Visualization
- **Google Maps API** - Location Features
- **date-fns** - Date Formatting
- **Vite** - Build Tool

## Setup

### Prerequisites

- Node.js 18+ and npm
- Google Maps API Key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Common/         # Common components (Button, Input, Table, etc.)
│   ├── Layout/         # Layout components (Header, Sidebar, Layout)
│   └── Map/            # Map components
├── config/             # Configuration files
├── context/            # React Context providers
├── pages/              # Page components
├── services/           # API service modules
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app with routing
```

## License

MIT
