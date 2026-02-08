"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            const user = await User_1.User.findById(decoded.userId).select('-password');
            if (!user || !user.isActive) {
                res.status(401).json({ error: 'User not found or inactive' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication error' });
        return;
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
