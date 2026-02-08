"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Registration validation
const registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    (0, express_validator_1.body)('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
];
// Login validation
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    (0, express_validator_1.body)('fcmToken').optional().isString(),
];
// Refresh token validation
const refreshTokenValidation = [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
// Update profile validation
const updateProfileValidation = [
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    (0, express_validator_1.body)('fcmToken').optional().isString(),
];
// Public routes with rate limiting
router.post('/register', rateLimiter_1.authLimiter, (0, validator_1.validate)(registerValidation), authController_1.register);
router.post('/login', rateLimiter_1.authLimiter, (0, validator_1.validate)(loginValidation), authController_1.login);
router.post('/refresh-token', rateLimiter_1.authLimiter, (0, validator_1.validate)(refreshTokenValidation), authController_1.refreshToken);
// Protected routes
router.post('/logout', auth_1.authenticate, authController_1.logout);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, (0, validator_1.validate)(updateProfileValidation), authController_1.updateProfile);
exports.default = router;
