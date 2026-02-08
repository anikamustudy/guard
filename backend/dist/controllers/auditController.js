"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogsByUser = exports.getAuditLogs = void 0;
const AuditLog_1 = require("../models/AuditLog");
const getAuditLogs = async (req, res) => {
    try {
        const { action, startDate, endDate, page = 1, limit = 50 } = req.query;
        const query = {};
        if (action)
            query.action = action;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate)
                query.timestamp.$gte = new Date(startDate);
            if (endDate)
                query.timestamp.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLog.find(query)
                .populate('userId', 'name email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AuditLog_1.AuditLog.countDocuments(query),
        ]);
        res.json({
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAuditLogs = getAuditLogs;
const getAuditLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action, startDate, endDate, page = 1, limit = 50 } = req.query;
        const query = { userId };
        if (action)
            query.action = action;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate)
                query.timestamp.$gte = new Date(startDate);
            if (endDate)
                query.timestamp.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLog.find(query)
                .populate('userId', 'name email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AuditLog_1.AuditLog.countDocuments(query),
        ]);
        res.json({
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get audit logs by user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAuditLogsByUser = getAuditLogsByUser;
