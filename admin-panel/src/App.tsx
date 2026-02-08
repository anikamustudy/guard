import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Auth/Login';

// Dashboard
import { Dashboard } from './pages/Dashboard/Dashboard';

// Guards
import { GuardList } from './pages/Guards/GuardList';
import { GuardDetail } from './pages/Guards/GuardDetail';

// Locations
import { LocationList } from './pages/Locations/LocationList';

// Shifts
import { ShiftList } from './pages/Shifts/ShiftList';

// Attendance
import { AttendanceList } from './pages/Attendance/AttendanceList';
import { AttendanceDetail } from './pages/Attendance/AttendanceDetail';

// Emergency
import { EmergencyList } from './pages/Emergency/EmergencyList';

// Audit
import { AuditLogs } from './pages/Audit/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Guards */}
          <Route
            path="/guards"
            element={
              <ProtectedRoute>
                <GuardList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guards/:id"
            element={
              <ProtectedRoute>
                <GuardDetail />
              </ProtectedRoute>
            }
          />

          {/* Locations */}
          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <LocationList />
              </ProtectedRoute>
            }
          />

          {/* Shifts */}
          <Route
            path="/shifts"
            element={
              <ProtectedRoute>
                <ShiftList />
              </ProtectedRoute>
            }
          />

          {/* Attendance */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/:id"
            element={
              <ProtectedRoute>
                <AttendanceDetail />
              </ProtectedRoute>
            }
          />

          {/* Emergency */}
          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyList />
              </ProtectedRoute>
            }
          />

          {/* Audit Logs */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
