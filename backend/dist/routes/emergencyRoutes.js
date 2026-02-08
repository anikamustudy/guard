"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const emergencyController_1 = require("../controllers/emergencyController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Create emergency alert validation
const createAlertValidation = [
    (0, express_validator_1.body)('locationId').optional().isMongoId().withMessage('Valid location ID is required'),
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];
// Update emergency alert validation
const updateAlertValidation = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'resolved', 'acknowledged'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
];
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['active', 'resolved', 'acknowledged'])
        .withMessage('Invalid status'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];
// Param validation
const idParamValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid alert ID is required'),
];
// All emergency routes require authentication
router.use(auth_1.authenticate);
// Guard can create emergency alert
router.post('/', rateLimiter_1.apiLimiter, (0, validator_1.validate)(createAlertValidation), emergencyController_1.createEmergencyAlert);
// Admin/Supervisor routes
router.get('/', (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)(queryValidation), emergencyController_1.getAllEmergencyAlerts);
router.get('/active', (0, auth_1.authorize)('admin', 'supervisor'), (0, validator_1.validate)(queryValidation), emergencyController_1.getActiveEmergencyAlerts);
router.put('/:id', (0, auth_1.authorize)('admin', 'supervisor'), rateLimiter_1.apiLimiter, (0, validator_1.validate)([...idParamValidation, ...updateAlertValidation]), emergencyController_1.updateEmergencyAlert);
exports.default = router;
