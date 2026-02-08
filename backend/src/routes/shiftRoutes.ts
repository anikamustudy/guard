import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
  getShiftsByGuard,
} from '../controllers/shiftController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Shift validation
const shiftValidation = [
  body('name').trim().notEmpty().withMessage('Shift name is required'),
  body('startTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format'),
  body('lateThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Late threshold must be a non-negative integer'),
  body('location').isMongoId().withMessage('Valid location ID is required'),
  body('assignedGuards')
    .optional()
    .isArray()
    .withMessage('Assigned guards must be an array'),
  body('assignedGuards.*')
    .optional()
    .isMongoId()
    .withMessage('Each guard ID must be valid'),
  body('daysOfWeek')
    .optional()
    .isArray()
    .withMessage('Days of week must be an array'),
  body('daysOfWeek.*')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day must be between 0 (Sunday) and 6 (Saturday)'),
];

// Update shift validation
const updateShiftValidation = [
  body('name').optional().trim().notEmpty().withMessage('Shift name cannot be empty'),
  body('startTime')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format'),
  body('lateThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Late threshold must be a non-negative integer'),
  body('location').optional().isMongoId().withMessage('Valid location ID is required'),
  body('assignedGuards')
    .optional()
    .isArray()
    .withMessage('Assigned guards must be an array'),
  body('assignedGuards.*')
    .optional()
    .isMongoId()
    .withMessage('Each guard ID must be valid'),
  body('daysOfWeek')
    .optional()
    .isArray()
    .withMessage('Days of week must be an array'),
  body('daysOfWeek.*')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day must be between 0 and 6'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Query validation
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('locationId').optional().isMongoId().withMessage('Valid location ID is required'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Param validation
const idParamValidation = [
  param('id').isMongoId().withMessage('Valid shift ID is required'),
];

const guardIdParamValidation = [
  param('guardId').isMongoId().withMessage('Valid guard ID is required'),
];

// All shift routes require authentication
router.use(authenticate);

// Admin/Supervisor routes
router.post(
  '/',
  authorize('admin', 'supervisor'),
  apiLimiter,
  validate(shiftValidation),
  createShift
);

router.get(
  '/',
  validate(queryValidation),
  getAllShifts
);

router.get(
  '/:id',
  validate(idParamValidation),
  getShiftById
);

router.put(
  '/:id',
  authorize('admin', 'supervisor'),
  apiLimiter,
  validate([...idParamValidation, ...updateShiftValidation]),
  updateShift
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(idParamValidation),
  deleteShift
);

router.get(
  '/guard/:guardId',
  validate([...guardIdParamValidation, ...queryValidation]),
  getShiftsByGuard
);

export default router;
