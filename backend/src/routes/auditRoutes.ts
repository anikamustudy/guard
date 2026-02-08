import { Router } from 'express';
import { param, query } from 'express-validator';
import { getAuditLogs, getAuditLogsByUser } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Query validation
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

// Param validation
const userIdParamValidation = [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
];

// All audit routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin only routes
router.get(
  '/',
  validate(queryValidation),
  getAuditLogs
);

router.get(
  '/user/:userId',
  validate([...userIdParamValidation, ...queryValidation]),
  getAuditLogsByUser
);

export default router;
