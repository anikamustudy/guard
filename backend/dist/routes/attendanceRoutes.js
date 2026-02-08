"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const attendanceController_1 = require("../controllers/attendanceController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Check-in validation
const checkInValidation = [
    (0, express_validator_1.body)('locationId').isMongoId().withMessage('Valid location ID is required'),
    (0, express_validator_1.body)('shiftId').isMongoId().withMessage('Valid shift ID is required'),
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    (0, express_validator_1.body)('selfieBase64').optional().isString().withMessage('Selfie must be a base64 string'),
];
// Check-out validation
const checkOutValidation = [
    (0, express_validator_1.body)('attendanceId').isMongoId().withMessage('Valid attendance ID is required'),
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];
// Query validation for attendance lists
const attendanceQueryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];
// Stats query validation
const statsQueryValidation = [
    ...attendanceQueryValidation,
    (0, express_validator_1.query)('userId').optional().isMongoId().withMessage('Valid user ID is required'),
];
// Guard routes
router.post('/check-in', auth_1.authenticate, rateLimiter_1.apiLimiter, (0, validator_1.validate)(checkInValidation), attendanceController_1.checkIn);
router.post('/check-out', auth_1.authenticate, rateLimiter_1.apiLimiter, (0, validator_1.validate)(checkOutValidation), attendanceController_1.checkOut);
router.get('/my-attendance', auth_1.authenticate, (0, validator_1.validate)(attendanceQueryValidation), attendanceController_1.getMyAttendance);
router.get('/today', auth_1.authenticate, attendanceController_1.getTodayAttendance);
// Admin/Supervisor routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)(attendanceQueryValidation), attendanceController_1.getAllAttendance);
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)(statsQueryValidation), attendanceController_1.getAttendanceStats);
exports.default = router;
