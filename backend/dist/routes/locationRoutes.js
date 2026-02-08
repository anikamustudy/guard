"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const locationController_1 = require("../controllers/locationController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Location validation
const locationValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Location name is required'),
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    (0, express_validator_1.body)('radius').isInt({ min: 1 }).withMessage('Radius must be a positive integer'),
    (0, express_validator_1.body)('address').trim().notEmpty().withMessage('Address is required'),
];
// Update location validation
const updateLocationValidation = [
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('Location name cannot be empty'),
    (0, express_validator_1.body)('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    (0, express_validator_1.body)('radius').optional().isInt({ min: 1 }).withMessage('Radius must be a positive integer'),
    (0, express_validator_1.body)('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
// Param validation
const idParamValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid location ID is required'),
];
// All location routes require authentication
router.use(auth_1.authenticate);
// Admin/Supervisor only routes
router.post('/', (0, auth_1.authorize)('admin', 'supervisor'), rateLimiter_1.apiLimiter, (0, validator_1.validate)(locationValidation), locationController_1.createLocation);
router.get('/', (0, validator_1.validate)(queryValidation), locationController_1.getAllLocations);
router.get('/:id', (0, validator_1.validate)(idParamValidation), locationController_1.getLocationById);
router.put('/:id', (0, auth_1.authorize)('admin', 'supervisor'), rateLimiter_1.apiLimiter, (0, validator_1.validate)([...idParamValidation, ...updateLocationValidation]), locationController_1.updateLocation);
router.delete('/:id', (0, auth_1.authorize)('admin'), (0, validator_1.validate)(idParamValidation), locationController_1.deleteLocation);
exports.default = router;
