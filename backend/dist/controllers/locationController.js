"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = exports.updateLocation = exports.getLocationById = exports.getAllLocations = exports.createLocation = void 0;
const DutyLocation_1 = require("../models/DutyLocation");
const AuditLog_1 = require("../models/AuditLog");
const createLocation = async (req, res) => {
    try {
        const { name, latitude, longitude, radius, address } = req.body;
        const location = await DutyLocation_1.DutyLocation.create({
            name,
            latitude,
            longitude,
            radius,
            address,
            createdBy: req.user._id,
        });
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'LOCATION_CREATED',
            metadata: {
                locationId: location._id,
                name: location.name,
            },
        });
        res.status(201).json({
            message: 'Location created successfully',
            location,
        });
    }
    catch (error) {
        console.error('Create location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createLocation = createLocation;
const getAllLocations = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive } = req.query;
        const query = {};
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const skip = (Number(page) - 1) * Number(limit);
        const [locations, total] = await Promise.all([
            DutyLocation_1.DutyLocation.find(query)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            DutyLocation_1.DutyLocation.countDocuments(query),
        ]);
        res.json({
            locations,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllLocations = getAllLocations;
const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await DutyLocation_1.DutyLocation.findById(id).populate('createdBy', 'name email');
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        res.json({ location });
    }
    catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getLocationById = getLocationById;
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, latitude, longitude, radius, address, isActive } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (latitude !== undefined)
            updateData.latitude = latitude;
        if (longitude !== undefined)
            updateData.longitude = longitude;
        if (radius !== undefined)
            updateData.radius = radius;
        if (address !== undefined)
            updateData.address = address;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const location = await DutyLocation_1.DutyLocation.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'LOCATION_UPDATED',
            metadata: {
                locationId: location._id,
                changes: updateData,
            },
        });
        res.json({
            message: 'Location updated successfully',
            location,
        });
    }
    catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateLocation = updateLocation;
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await DutyLocation_1.DutyLocation.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'LOCATION_DELETED',
            metadata: {
                locationId: location._id,
                name: location.name,
            },
        });
        res.json({
            message: 'Location deleted successfully',
            location,
        });
    }
    catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteLocation = deleteLocation;
