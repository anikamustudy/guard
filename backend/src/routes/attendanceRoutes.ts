import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  getAttendanceStats,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Check-in validation
const checkInValidation = [
  body('locationId').isMongoId().withMessage('Valid location ID is required'),
  body('shiftId').isMongoId().withMessage('Valid shift ID is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('selfieBase64').optional().isString().withMessage('Selfie must be a base64 string'),
];

// Check-out validation
const checkOutValidation = [
  body('attendanceId').isMongoId().withMessage('Valid attendance ID is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];

// Query validation for attendance lists
const attendanceQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

// Guard routes
router.post('/check-in', authenticate, apiLimiter, validate(checkInValidation), checkIn);
router.post('/check-out', authenticate, apiLimiter, validate(checkOutValidation), checkOut);
router.get('/my-attendance', authenticate, validate(attendanceQueryValidation), getMyAttendance);
router.get('/today', authenticate, getTodayAttendance);

// Admin/Supervisor routes
router.get(
  '/',
  authenticate,
  authorize('admin', 'supervisor'),
  validate(attendanceQueryValidation),
  getAllAttendance
);

router.get(
  '/stats',
  authenticate,
  authorize('admin', 'supervisor'),
  validate([
    ...attendanceQueryValidation,
    query('userId').optional().isMongoId().withMessage('Valid user ID is required'),
  ]),
  getAttendanceStats
);

export default router;
