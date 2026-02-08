"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveEmergencyAlerts = exports.updateEmergencyAlert = exports.getAllEmergencyAlerts = exports.createEmergencyAlert = void 0;
const EmergencyAlert_1 = require("../models/EmergencyAlert");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const firebase_1 = require("../config/firebase");
const createEmergencyAlert = async (req, res) => {
    try {
        const { locationId, latitude, longitude } = req.body;
        const userId = req.user._id;
        const alert = await EmergencyAlert_1.EmergencyAlert.create({
            userId,
            locationId,
            gpsCoordinates: {
                latitude,
                longitude,
            },
            timestamp: new Date(),
            status: 'active',
        });
        await AuditLog_1.AuditLog.create({
            userId,
            action: 'EMERGENCY_ALERT_CREATED',
            metadata: {
                alertId: alert._id,
                locationId,
                coordinates: { latitude, longitude },
            },
        });
        // Notify all supervisors and admins
        const supervisorsAndAdmins = await User_1.User.find({
            role: { $in: ['supervisor', 'admin'] },
            isActive: true,
            fcmToken: { $exists: true, $ne: null },
        });
        const notificationPromises = supervisorsAndAdmins.map((user) => {
            if (user.fcmToken) {
                return (0, firebase_1.sendPushNotification)(user.fcmToken, '🚨 Emergency Alert', `${req.user.name} triggered an emergency alert!`).catch((error) => {
                    console.error(`Failed to send notification to ${user.email}:`, error);
                });
            }
        });
        await Promise.allSettled(notificationPromises);
        const populatedAlert = await EmergencyAlert_1.EmergencyAlert.findById(alert._id)
            .populate('userId', 'name email phone')
            .populate('locationId', 'name address');
        res.status(201).json({
            message: 'Emergency alert created successfully',
            alert: populatedAlert,
        });
    }
    catch (error) {
        console.error('Create emergency alert error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createEmergencyAlert = createEmergencyAlert;
const getAllEmergencyAlerts = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate)
                query.timestamp.$gte = new Date(startDate);
            if (endDate)
                query.timestamp.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [alerts, total] = await Promise.all([
            EmergencyAlert_1.EmergencyAlert.find(query)
                .populate('userId', 'name email phone')
                .populate('locationId', 'name address')
                .populate('resolvedBy', 'name email')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(Number(limit)),
            EmergencyAlert_1.EmergencyAlert.countDocuments(query),
        ]);
        res.json({
            alerts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all emergency alerts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllEmergencyAlerts = getAllEmergencyAlerts;
const updateEmergencyAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'resolved' || status === 'acknowledged') {
                updateData.resolvedBy = req.user._id;
                updateData.resolvedAt = new Date();
            }
        }
        if (notes !== undefined)
            updateData.notes = notes;
        const alert = await EmergencyAlert_1.EmergencyAlert.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'name email phone')
            .populate('locationId', 'name address')
            .populate('resolvedBy', 'name email');
        if (!alert) {
            res.status(404).json({ error: 'Emergency alert not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'EMERGENCY_ALERT_UPDATED',
            metadata: {
                alertId: alert._id,
                changes: updateData,
                updatedBy: req.user.email,
            },
        });
        // Notify the guard who triggered the alert
        const guard = await User_1.User.findById(alert.userId);
        if (guard && guard.fcmToken) {
            try {
                const statusMessage = status === 'acknowledged'
                    ? 'Your emergency alert has been acknowledged'
                    : 'Your emergency alert has been resolved';
                await (0, firebase_1.sendPushNotification)(guard.fcmToken, 'Emergency Alert Update', statusMessage);
            }
            catch (error) {
                console.error('Failed to send notification to guard:', error);
            }
        }
        res.json({
            message: 'Emergency alert updated successfully',
            alert,
        });
    }
    catch (error) {
        console.error('Update emergency alert error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateEmergencyAlert = updateEmergencyAlert;
const getActiveEmergencyAlerts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [alerts, total] = await Promise.all([
            EmergencyAlert_1.EmergencyAlert.find({ status: 'active' })
                .populate('userId', 'name email phone')
                .populate('locationId', 'name address latitude longitude')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(Number(limit)),
            EmergencyAlert_1.EmergencyAlert.countDocuments({ status: 'active' }),
        ]);
        res.json({
            alerts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get active emergency alerts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getActiveEmergencyAlerts = getActiveEmergencyAlerts;
