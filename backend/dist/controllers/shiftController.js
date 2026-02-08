"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShiftsByGuard = exports.deleteShift = exports.updateShift = exports.getShiftById = exports.getAllShifts = exports.createShift = void 0;
const Shift_1 = require("../models/Shift");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const createShift = async (req, res) => {
    try {
        const { name, startTime, endTime, lateThreshold, location, assignedGuards, daysOfWeek } = req.body;
        const shift = await Shift_1.Shift.create({
            name,
            startTime,
            endTime,
            lateThreshold: lateThreshold || 15,
            location,
            assignedGuards: assignedGuards || [],
            daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        });
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'SHIFT_CREATED',
            metadata: {
                shiftId: shift._id,
                name: shift.name,
                location,
            },
        });
        res.status(201).json({
            message: 'Shift created successfully',
            shift,
        });
    }
    catch (error) {
        console.error('Create shift error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createShift = createShift;
const getAllShifts = async (req, res) => {
    try {
        const { page = 1, limit = 20, locationId, isActive } = req.query;
        const query = {};
        if (locationId)
            query.location = locationId;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const skip = (Number(page) - 1) * Number(limit);
        const [shifts, total] = await Promise.all([
            Shift_1.Shift.find(query)
                .populate('location', 'name address')
                .populate('assignedGuards', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Shift_1.Shift.countDocuments(query),
        ]);
        res.json({
            shifts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get shifts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllShifts = getAllShifts;
const getShiftById = async (req, res) => {
    try {
        const { id } = req.params;
        const shift = await Shift_1.Shift.findById(id)
            .populate('location', 'name address latitude longitude radius')
            .populate('assignedGuards', 'name email phone');
        if (!shift) {
            res.status(404).json({ error: 'Shift not found' });
            return;
        }
        res.json({ shift });
    }
    catch (error) {
        console.error('Get shift error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getShiftById = getShiftById;
const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, lateThreshold, location, assignedGuards, daysOfWeek, isActive } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (startTime !== undefined)
            updateData.startTime = startTime;
        if (endTime !== undefined)
            updateData.endTime = endTime;
        if (lateThreshold !== undefined)
            updateData.lateThreshold = lateThreshold;
        if (location !== undefined)
            updateData.location = location;
        if (assignedGuards !== undefined)
            updateData.assignedGuards = assignedGuards;
        if (daysOfWeek !== undefined)
            updateData.daysOfWeek = daysOfWeek;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const shift = await Shift_1.Shift.findByIdAndUpdate(id, updateData, { new: true })
            .populate('location', 'name address')
            .populate('assignedGuards', 'name email phone');
        if (!shift) {
            res.status(404).json({ error: 'Shift not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'SHIFT_UPDATED',
            metadata: {
                shiftId: shift._id,
                changes: updateData,
            },
        });
        res.json({
            message: 'Shift updated successfully',
            shift,
        });
    }
    catch (error) {
        console.error('Update shift error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateShift = updateShift;
const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const shift = await Shift_1.Shift.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!shift) {
            res.status(404).json({ error: 'Shift not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'SHIFT_DELETED',
            metadata: {
                shiftId: shift._id,
                name: shift.name,
            },
        });
        res.json({
            message: 'Shift deleted successfully',
            shift,
        });
    }
    catch (error) {
        console.error('Delete shift error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteShift = deleteShift;
const getShiftsByGuard = async (req, res) => {
    try {
        const { guardId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        // Verify guard exists
        const guard = await User_1.User.findById(guardId);
        if (!guard || guard.role !== 'guard') {
            res.status(404).json({ error: 'Guard not found' });
            return;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [shifts, total] = await Promise.all([
            Shift_1.Shift.find({
                assignedGuards: guardId,
                isActive: true,
            })
                .populate('location', 'name address')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Shift_1.Shift.countDocuments({
                assignedGuards: guardId,
                isActive: true,
            }),
        ]);
        res.json({
            shifts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get shifts by guard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getShiftsByGuard = getShiftsByGuard;
