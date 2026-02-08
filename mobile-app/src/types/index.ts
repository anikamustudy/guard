export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'guard' | 'supervisor' | 'admin';
  profileImage?: string;
  guardProfile?: GuardProfile;
}

export interface GuardProfile {
  id: string;
  userId: string;
  employeeId: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  guardId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  location?: Location;
  guard?: User;
  attendance?: Attendance;
}

export interface Attendance {
  id: string;
  shiftId: string;
  guardId: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkInSelfie?: string;
  checkOutSelfie?: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  notes?: string;
  shift?: Shift;
}

export interface EmergencyAlert {
  id: string;
  guardId: string;
  locationId?: string;
  latitude: number;
  longitude: number;
  alertType: 'panic' | 'medical' | 'security' | 'other';
  message?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  guard?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CheckInRequest {
  shiftId: string;
  latitude: number;
  longitude: number;
  selfie: string;
  notes?: string;
}

export interface CheckOutRequest {
  attendanceId: string;
  latitude: number;
  longitude: number;
  selfie: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
