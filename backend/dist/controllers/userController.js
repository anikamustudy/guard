"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuardsByLocation = exports.assignLocation = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const DutyLocation_1 = require("../models/DutyLocation");
const AuditLog_1 = require("../models/AuditLog");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, isActive } = req.query;
        const query = {};
        if (role)
            query.role = role;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User_1.User.find(query)
                .populate('assignedLocations', 'name address')
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            User_1.User.countDocuments(query),
        ]);
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id)
            .populate('assignedLocations', 'name address latitude longitude')
            .select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, email, phone, password, role, assignedLocations } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }
        const user = await User_1.User.create({
            name,
            email,
            phone,
            password,
            role: role || 'guard',
            assignedLocations: assignedLocations || [],
        });
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'USER_CREATED',
            metadata: {
                createdUserId: user._id,
                role: user.role,
                createdBy: req.user.email,
            },
        });
        const userResponse = await User_1.User.findById(user._id)
            .populate('assignedLocations', 'name address')
            .select('-password');
        res.status(201).json({
            message: 'User created successfully',
            user: userResponse,
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, password } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (role !== undefined)
            updateData.role = role;
        // Handle password update separately to ensure it gets hashed
        if (password) {
            const salt = await bcrypt_1.default.genSalt(10);
            updateData.password = await bcrypt_1.default.hash(password, salt);
        }
        const user = await User_1.User.findByIdAndUpdate(id, updateData, { new: true })
            .populate('assignedLocations', 'name address')
            .select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'USER_UPDATED',
            metadata: {
                updatedUserId: user._id,
                changes: updateData,
                updatedBy: req.user.email,
            },
        });
        res.json({
            message: 'User updated successfully',
            user,
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user._id.toString()) {
            res.status(400).json({ error: 'Cannot delete your own account' });
            return;
        }
        const user = await User_1.User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'USER_DELETED',
            metadata: {
                deletedUserId: user._id,
                deletedUserEmail: user.email,
                deletedBy: req.user.email,
            },
        });
        res.json({
            message: 'User deactivated successfully',
            user,
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
const assignLocation = async (req, res) => {
    try {
        const { userId, locationId } = req.body;
        // Verify user exists
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Verify location exists
        const location = await DutyLocation_1.DutyLocation.findById(locationId);
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        // Check if already assigned
        const isAlreadyAssigned = user.assignedLocations.some((loc) => loc.toString() === locationId);
        if (isAlreadyAssigned) {
            res.status(400).json({ error: 'User is already assigned to this location' });
            return;
        }
        user.assignedLocations.push(locationId);
        await user.save();
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'LOCATION_ASSIGNED',
            metadata: {
                assignedUserId: userId,
                locationId,
                assignedBy: req.user.email,
            },
        });
        const updatedUser = await User_1.User.findById(userId)
            .populate('assignedLocations', 'name address')
            .select('-password');
        res.json({
            message: 'Location assigned successfully',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Assign location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.assignLocation = assignLocation;
const getGuardsByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        // Verify location exists
        const location = await DutyLocation_1.DutyLocation.findById(locationId);
        if (!location) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [guards, total] = await Promise.all([
            User_1.User.find({
                assignedLocations: locationId,
                role: 'guard',
                isActive: true,
            })
                .select('-password')
                .sort({ name: 1 })
                .skip(skip)
                .limit(Number(limit)),
            User_1.User.countDocuments({
                assignedLocations: locationId,
                role: 'guard',
                isActive: true,
            }),
        ]);
        res.json({
            guards,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get guards by location error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getGuardsByLocation = getGuardsByLocation;
