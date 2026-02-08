export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'GUARD';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guard extends User {
  employeeId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  assignedLocations?: Location[];
  shifts?: Shift[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  guardId: string;
  guard?: Guard;
  locationId: string;
  location?: Location;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  guardId: string;
  guard?: Guard;
  shiftId: string;
  shift?: Shift;
  locationId: string;
  location?: Location;
  checkInTime: string;
  checkOutTime?: string;
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkInSelfie?: string;
  checkOutSelfie?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'LATE' | 'ABSENT';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Emergency {
  id: string;
  guardId: string;
  guard?: Guard;
  locationId: string;
  location?: Location;
  type: 'PANIC' | 'MEDICAL' | 'SECURITY' | 'OTHER';
  description: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalGuards: number;
  activeGuards: number;
  totalLocations: number;
  activeShifts: number;
  todayAttendance: number;
  pendingEmergencies: number;
  lateCheckIns: number;
  absentToday: number;
}

export interface AttendanceReport {
  date: string;
  totalShifts: number;
  attended: number;
  late: number;
  absent: number;
  attendanceRate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  locationId?: string;
  guardId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
