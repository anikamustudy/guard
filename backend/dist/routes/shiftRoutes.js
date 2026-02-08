"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const shiftController_1 = require("../controllers/shiftController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Shift validation
const shiftValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Shift name is required'),
    (0, express_validator_1.body)('startTime')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:mm format'),
    (0, express_validator_1.body)('endTime')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:mm format'),
    (0, express_validator_1.body)('lateThreshold')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Late threshold must be a non-negative integer'),
    (0, express_validator_1.body)('location').isMongoId().withMessage('Valid location ID is required'),
    (0, express_validator_1.body)('assignedGuards')
        .optional()
        .isArray()
        .withMessage('Assigned guards must be an array'),
    (0, express_validator_1.body)('assignedGuards.*')
        .optional()
        .isMongoId()
        .withMessage('Each guard ID must be valid'),
    (0, express_validator_1.body)('daysOfWeek')
        .optional()
        .isArray()
        .withMessage('Days of week must be an array'),
    (0, express_validator_1.body)('daysOfWeek.*')
        .optional()
        .isInt({ min: 0, max: 6 })
        .withMessage('Day must be between 0 (Sunday) and 6 (Saturday)'),
];
// Update shift validation
const updateShiftValidation = [
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('Shift name cannot be empty'),
    (0, express_validator_1.body)('startTime')
        .optional()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:mm format'),
    (0, express_validator_1.body)('endTime')
        .optional()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:mm format'),
    (0, express_validator_1.body)('lateThreshold')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Late threshold must be a non-negative integer'),
    (0, express_validator_1.body)('location').optional().isMongoId().withMessage('Valid location ID is required'),
    (0, express_validator_1.body)('assignedGuards')
        .optional()
        .isArray()
        .withMessage('Assigned guards must be an array'),
    (0, express_validator_1.body)('assignedGuards.*')
        .optional()
        .isMongoId()
        .withMessage('Each guard ID must be valid'),
    (0, express_validator_1.body)('daysOfWeek')
        .optional()
        .isArray()
        .withMessage('Days of week must be an array'),
    (0, express_validator_1.body)('daysOfWeek.*')
        .optional()
        .isInt({ min: 0, max: 6 })
        .withMessage('Day must be between 0 and 6'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('locationId').optional().isMongoId().withMessage('Valid location ID is required'),
    (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
// Param validation
const idParamValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid shift ID is required'),
];
const guardIdParamValidation = [
    (0, express_validator_1.param)('guardId').isMongoId().withMessage('Valid guard ID is required'),
];
// All shift routes require authentication
router.use(auth_1.authenticate);
// Admin/Supervisor routes
router.post('/', (0, auth_1.authorize)('admin', 'supervisor'), rateLimiter_1.apiLimiter, (0, validator_1.validate)(shiftValidation), shiftController_1.createShift);
router.get('/', (0, validator_1.validate)(queryValidation), shiftController_1.getAllShifts);
router.get('/:id', (0, validator_1.validate)(idParamValidation), shiftController_1.getShiftById);
router.put('/:id', (0, auth_1.authorize)('admin', 'supervisor'), rateLimiter_1.apiLimiter, (0, validator_1.validate)([...idParamValidation, ...updateShiftValidation]), shiftController_1.updateShift);
router.delete('/:id', (0, auth_1.authorize)('admin'), (0, validator_1.validate)(idParamValidation), shiftController_1.deleteShift);
router.get('/guard/:guardId', (0, validator_1.validate)([...guardIdParamValidation, ...queryValidation]), shiftController_1.getShiftsByGuard);
exports.default = router;
