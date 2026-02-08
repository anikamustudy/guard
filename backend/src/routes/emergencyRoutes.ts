import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createEmergencyAlert,
  getAllEmergencyAlerts,
  updateEmergencyAlert,
  getActiveEmergencyAlerts,
} from '../controllers/emergencyController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Create emergency alert validation
const createAlertValidation = [
  body('locationId').optional().isMongoId().withMessage('Valid location ID is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];

// Update emergency alert validation
const updateAlertValidation = [
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'acknowledged'])
    .withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

// Query validation
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'resolved', 'acknowledged'])
    .withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

// Param validation
const idParamValidation = [
  param('id').isMongoId().withMessage('Valid alert ID is required'),
];

// All emergency routes require authentication
router.use(authenticate);

// Guard can create emergency alert
router.post(
  '/',
  apiLimiter,
  validate(createAlertValidation),
  createEmergencyAlert
);

// Admin/Supervisor routes
router.get(
  '/',
  authorize('admin', 'supervisor'),
  validate(queryValidation),
  getAllEmergencyAlerts
);

router.get(
  '/active',
  authorize('admin', 'supervisor'),
  validate(queryValidation),
  getActiveEmergencyAlerts
);

router.put(
  '/:id',
  authorize('admin', 'supervisor'),
  apiLimiter,
  validate([...idParamValidation, ...updateAlertValidation]),
  updateEmergencyAlert
);

export default router;
