import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Registration validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('fcmToken').optional().isString(),
];

// Refresh token validation
const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Update profile validation
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('fcmToken').optional().isString(),
];

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/refresh-token', authLimiter, validate(refreshTokenValidation), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileValidation), updateProfile);

export default router;
