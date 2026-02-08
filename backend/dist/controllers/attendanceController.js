"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceStats = exports.getAllAttendance = exports.getTodayAttendance = exports.getMyAttendance = exports.checkOut = exports.checkIn = void 0;
const Attendance_1 = require("../models/Attendance");
const DutyLocation_1 = require("../models/DutyLocation");
const Shift_1 = require("../models/Shift");
const AuditLog_1 = require("../models/AuditLog");
const geolocation_1 = require("../utils/geolocation");
const cloudinary_1 = require("../config/cloudinary");
const firebase_1 = require("../config/firebase");
const checkIn = async (req, res) => {
    try {
        const { locationId, shiftId, latitude, longitude, selfieBase64 } = req.body;
        const userId = req.user._id;
        // Validate shift assignment
        const shift = await Shift_1.Shift.findById(shiftId).populate('location');
        if (!shift) {
            res.status(404).json({ error: 'Shift not found' });
            return;
        }
        // Check if user is assigned to this shift
        const isAssigned = shift.assignedGuards.some((guardId) => guardId.toString() === userId.toString());
        if (!isAssigned && req.user.role === 'guard') {
            res.status(403).json({ error: 'You are not assigned to this shift' });
            return;
        }
        // Get location
        const location = await DutyLocation_1.DutyLocation.findById(locationId);
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        // Check geofencing
        const { isWithinRadius, distance } = (0, geolocation_1.isWithinGeofence)(latitude, longitude, location.latitude, location.longitude, location.radius);
        if (!isWithinRadius) {
            await AuditLog_1.AuditLog.create({
                userId,
                action: 'CHECK_IN_FAILED',
                metadata: {
                    reason: 'Outside geofence',
                    distance,
                    allowedRadius: location.radius,
                    locationId,
                },
            });
            res.status(400).json({
                error: 'You are outside the allowed location radius',
                distance: Math.round(distance),
                allowedRadius: location.radius,
            });
            return;
        }
        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await Attendance_1.Attendance.findOne({
            userId,
            shiftId,
            createdAt: { $gte: today },
        });
        if (existingAttendance && existingAttendance.checkInTime) {
            res.status(400).json({ error: 'Already checked in for this shift today' });
            return;
        }
        // Upload selfie to Cloudinary
        let selfieUrl = '';
        if (selfieBase64) {
            try {
                const uploadResult = await cloudinary_1.cloudinary.uploader.upload(selfieBase64, {
                    folder: 'guard-attendance',
                    resource_type: 'image',
                });
                selfieUrl = uploadResult.secure_url;
            }
            catch (uploadError) {
                console.error('Selfie upload error:', uploadError);
                res.status(400).json({ error: 'Failed to upload selfie' });
                return;
            }
        }
        // Determine if late
        const now = new Date();
        const [shiftHour, shiftMinute] = shift.startTime.split(':').map(Number);
        const shiftStart = new Date(now);
        shiftStart.setHours(shiftHour, shiftMinute, 0, 0);
        // Handle shifts that may have started yesterday (overnight shifts)
        if (shiftStart > now) {
            shiftStart.setDate(shiftStart.getDate() - 1);
        }
        const isLate = now > new Date(shiftStart.getTime() + shift.lateThreshold * 60000);
        const status = isLate ? 'late' : 'present';
        // Create or update attendance
        const attendance = existingAttendance
            ? await Attendance_1.Attendance.findByIdAndUpdate(existingAttendance._id, {
                checkInTime: now,
                status,
                selfieUrl,
                'gpsCoordinates.checkIn': { latitude, longitude },
                'distanceFromLocation.checkIn': distance,
            }, { new: true })
            : await Attendance_1.Attendance.create({
                userId,
                locationId,
                shiftId,
                checkInTime: now,
                status,
                selfieUrl,
                gpsCoordinates: {
                    checkIn: { latitude, longitude },
                },
                distanceFromLocation: {
                    checkIn: distance,
                },
            });
        if (!attendance) {
            res.status(500).json({ error: 'Failed to create attendance record' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId,
            action: 'CHECK_IN_SUCCESS',
            metadata: {
                attendanceId: attendance._id,
                locationId,
                shiftId,
                status,
                distance,
            },
        });
        // Send notification if late
        if (isLate && req.user.fcmToken) {
            try {
                await (0, firebase_1.sendPushNotification)(req.user.fcmToken, 'Late Check-in', `You checked in ${Math.floor((now.getTime() - shiftStart.getTime()) / 60000)} minutes late.`);
            }
            catch (error) {
                console.error('Failed to send notification:', error);
            }
        }
        res.status(201).json({
            message: 'Check-in successful',
            attendance,
            status,
            distance: Math.round(distance),
        });
    }
    catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Server error during check-in' });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    try {
        const { attendanceId, latitude, longitude } = req.body;
        const userId = req.user._id;
        const attendance = await Attendance_1.Attendance.findOne({
            _id: attendanceId,
            userId,
        }).populate('locationId shiftId');
        if (!attendance) {
            res.status(404).json({ error: 'Attendance record not found' });
            return;
        }
        if (attendance.checkOutTime) {
            res.status(400).json({ error: 'Already checked out' });
            return;
        }
        if (!attendance.checkInTime) {
            res.status(400).json({ error: 'Cannot check out without checking in first' });
            return;
        }
        // Verify location for checkout
        const location = await DutyLocation_1.DutyLocation.findById(attendance.locationId);
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        const { isWithinRadius, distance } = (0, geolocation_1.isWithinGeofence)(latitude, longitude, location.latitude, location.longitude, location.radius);
        const now = new Date();
        // Type guard to ensure shift is populated
        if (!attendance.shiftId || typeof attendance.shiftId === 'string') {
            res.status(500).json({ error: 'Shift data not properly loaded' });
            return;
        }
        const shift = attendance.shiftId;
        const [endHour, endMinute] = shift.endTime.split(':').map(Number);
        const shiftEnd = new Date(now);
        shiftEnd.setHours(endHour, endMinute, 0, 0);
        // Handle shifts that end the next day (overnight shifts)
        const [startHour] = shift.startTime.split(':').map(Number);
        if (endHour < startHour) {
            shiftEnd.setDate(shiftEnd.getDate() + 1);
        }
        // Check for early checkout
        const isEarlyCheckout = now < shiftEnd;
        const newStatus = isEarlyCheckout ? 'early-checkout' : attendance.status;
        attendance.checkOutTime = now;
        attendance.status = newStatus;
        attendance.gpsCoordinates.checkOut = { latitude, longitude };
        attendance.distanceFromLocation.checkOut = distance;
        await attendance.save();
        await AuditLog_1.AuditLog.create({
            userId,
            action: 'CHECK_OUT_SUCCESS',
            metadata: {
                attendanceId: attendance._id,
                status: newStatus,
                distance,
                isWithinGeofence: isWithinRadius,
            },
        });
        res.json({
            message: 'Check-out successful',
            attendance,
            status: newStatus,
            distance: Math.round(distance),
        });
    }
    catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Server error during check-out' });
    }
};
exports.checkOut = checkOut;
const getMyAttendance = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;
        const userId = req.user._id;
        const query = { userId };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [attendance, total] = await Promise.all([
            Attendance_1.Attendance.find(query)
                .populate('locationId', 'name address')
                .populate('shiftId', 'name startTime endTime')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Attendance_1.Attendance.countDocuments(query),
        ]);
        res.json({
            attendance,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getMyAttendance = getMyAttendance;
const getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance_1.Attendance.findOne({
            userId,
            createdAt: { $gte: today },
        })
            .populate('locationId', 'name address latitude longitude')
            .populate('shiftId', 'name startTime endTime');
        res.json({ attendance });
    }
    catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getTodayAttendance = getTodayAttendance;
const getAllAttendance = async (req, res) => {
    try {
        const { startDate, endDate, locationId, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        if (locationId)
            query.locationId = locationId;
        if (status)
            query.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const [attendance, total] = await Promise.all([
            Attendance_1.Attendance.find(query)
                .populate('userId', 'name email phone')
                .populate('locationId', 'name address')
                .populate('shiftId', 'name startTime endTime')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Attendance_1.Attendance.countDocuments(query),
        ]);
        res.json({
            attendance,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllAttendance = getAllAttendance;
const getAttendanceStats = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        if (userId)
            query.userId = userId;
        const stats = await Attendance_1.Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        const formattedStats = {
            present: 0,
            late: 0,
            absent: 0,
            'early-checkout': 0,
            'checked-in': 0,
        };
        stats.forEach((stat) => {
            formattedStats[stat._id] = stat.count;
        });
        res.json({ stats: formattedStats });
    }
    catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAttendanceStats = getAttendanceStats;
