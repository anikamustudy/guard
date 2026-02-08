"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Create user validation
const createUserValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    (0, express_validator_1.body)('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('assignedLocations')
        .optional()
        .isArray()
        .withMessage('Assigned locations must be an array'),
    (0, express_validator_1.body)('assignedLocations.*')
        .optional()
        .isMongoId()
        .withMessage('Each location ID must be valid'),
];
// Update user validation
const updateUserValidation = [
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    (0, express_validator_1.body)('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
];
// Assign location validation
const assignLocationValidation = [
    (0, express_validator_1.body)('userId').isMongoId().withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('locationId').isMongoId().withMessage('Valid location ID is required'),
];
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('role').optional().isIn(['guard', 'supervisor', 'admin']).withMessage('Invalid role'),
    (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
// Param validation
const idParamValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid user ID is required'),
];
const locationIdParamValidation = [
    (0, express_validator_1.param)('locationId').isMongoId().withMessage('Valid location ID is required'),
];
// All user routes require authentication
router.use(auth_1.authenticate);
// Admin/Supervisor routes
router.get('/', (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)(queryValidation), userController_1.getAllUsers);
router.get('/:id', (0, validator_1.validate)(idParamValidation), userController_1.getUserById);
// Admin only routes
router.post('/', (0, auth_1.authorize)('admin'), rateLimiter_1.apiLimiter, (0, validator_1.validate)(createUserValidation), userController_1.createUser);
router.put('/:id', (0, auth_1.authorize)('admin'), rateLimiter_1.apiLimiter, (0, validator_1.validate)([...idParamValidation, ...updateUserValidation]), userController_1.updateUser);
router.delete('/:id', (0, auth_1.authorize)('admin'), (0, validator_1.validate)(idParamValidation), userController_1.deleteUser);
router.post('/assign-location', (0, auth_1.authorize)('admin'), rateLimiter_1.apiLimiter, (0, validator_1.validate)(assignLocationValidation), userController_1.assignLocation);
// Get guards by location - admin/supervisor
router.get('/location/:locationId/guards', (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)([...locationIdParamValidation, ...queryValidation]), userController_1.getGuardsByLocation);
exports.default = router;
