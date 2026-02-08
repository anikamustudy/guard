"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auditController_1 = require("../controllers/auditController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const router = (0, express_1.Router)();
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('action').optional().isString().withMessage('Action must be a string'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];
// Param validation
const userIdParamValidation = [
    (0, express_validator_1.param)('userId').isMongoId().withMessage('Valid user ID is required'),
];
// All audit routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Admin only routes
router.get('/', (0, validator_1.validate)(queryValidation), auditController_1.getAuditLogs);
router.get('/user/:userId', (0, validator_1.validate)([...userIdParamValidation, ...queryValidation]), auditController_1.getAuditLogsByUser);
exports.default = router;
