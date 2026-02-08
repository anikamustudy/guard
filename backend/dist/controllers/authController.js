"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const user = await User_1.User.create({
            name,
            email,
            phone,
            password,
            role: role || 'guard',
        });
        await AuditLog_1.AuditLog.create({
            userId: user._id,
            action: 'USER_REGISTERED',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        const accessToken = (0, jwt_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, fcmToken } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ error: 'Account is inactive' });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await AuditLog_1.AuditLog.create({
                userId: user._id,
                action: 'LOGIN_FAILED',
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    reason: 'Invalid password',
                },
            });
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Update FCM token if provided
        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }
        await AuditLog_1.AuditLog.create({
            userId: user._id,
            action: 'LOGIN_SUCCESS',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        const accessToken = (0, jwt_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                assignedLocations: user.assignedLocations,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await User_1.User.findById(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({ error: 'User not found or inactive' });
                return;
            }
            const newAccessToken = (0, jwt_1.generateAccessToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const newRefreshToken = (0, jwt_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid or expired refresh token' });
        }
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        if (req.user) {
            await AuditLog_1.AuditLog.create({
                userId: req.user._id,
                action: 'LOGOUT',
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            // Clear FCM token
            await User_1.User.findByIdAndUpdate(req.user._id, { fcmToken: null });
        }
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id)
            .populate('assignedLocations')
            .select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, phone, fcmToken } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phone)
            updateData.phone = phone;
        if (fcmToken)
            updateData.fcmToken = fcmToken;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        await AuditLog_1.AuditLog.create({
            userId: req.user._id,
            action: 'PROFILE_UPDATED',
            metadata: {
                ipAddress: req.ip,
                changes: updateData,
            },
        });
        res.json({
            message: 'Profile updated successfully',
            user,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
