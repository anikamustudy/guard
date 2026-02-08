import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Location validation
const locationValidation = [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('radius').isInt({ min: 1 }).withMessage('Radius must be a positive integer'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// Update location validation
const updateLocationValidation = [
  body('name').optional().trim().notEmpty().withMessage('Location name cannot be empty'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('radius').optional().isInt({ min: 1 }).withMessage('Radius must be a positive integer'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Query validation
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Param validation
const idParamValidation = [
  param('id').isMongoId().withMessage('Valid location ID is required'),
];

// All location routes require authentication
router.use(authenticate);

// Admin/Supervisor only routes
router.post(
  '/',
  authorize('admin', 'supervisor'),
  apiLimiter,
  validate(locationValidation),
  createLocation
);

router.get(
  '/',
  validate(queryValidation),
  getAllLocations
);

router.get(
  '/:id',
  validate(idParamValidation),
  getLocationById
);

router.put(
  '/:id',
  authorize('admin', 'supervisor'),
  apiLimiter,
  validate([...idParamValidation, ...updateLocationValidation]),
  updateLocation
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(idParamValidation),
  deleteLocation
);

export default router;
