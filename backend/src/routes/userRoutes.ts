import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignLocation,
  getGuardsByLocation,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Create user validation
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
  body('assignedLocations')
    .optional()
    .isArray()
    .withMessage('Assigned locations must be an array'),
  body('assignedLocations.*')
    .optional()
    .isMongoId()
    .withMessage('Each location ID must be valid'),
];

// Update user validation
const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

// Assign location validation
const assignLocationValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('locationId').isMongoId().withMessage('Valid location ID is required'),
];

// Query validation
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Param validation
const idParamValidation = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
];

const locationIdParamValidation = [
  param('locationId').isMongoId().withMessage('Valid location ID is required'),
];

// All user routes require authentication
router.use(authenticate);

// Admin/Supervisor routes
router.get(
  '/',
  authorize('admin', 'supervisor'),
  validate(queryValidation),
  getAllUsers
);

router.get(
  '/:id',
  validate(idParamValidation),
  getUserById
);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  apiLimiter,
  validate(createUserValidation),
  createUser
);

router.put(
  '/:id',
  authorize('admin'),
  apiLimiter,
  validate([...idParamValidation, ...updateUserValidation]),
  updateUser
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(idParamValidation),
  deleteUser
);

router.post(
  '/assign-location',
  authorize('admin'),
  apiLimiter,
  validate(assignLocationValidation),
  assignLocation
);

// Get guards by location - admin/supervisor
router.get(
  '/location/:locationId/guards',
  authorize('admin', 'supervisor'),
  validate([...locationIdParamValidation, ...queryValidation]),
  getGuardsByLocation
);

export default router;
