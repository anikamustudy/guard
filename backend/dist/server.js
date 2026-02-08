"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config/config");
const database_1 = require("./config/database");
const firebase_1 = require("./config/firebase");
const cloudinary_1 = require("./config/cloudinary");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const emergencyRoutes_1 = __importDefault(require("./routes/emergencyRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const app = (0, express_1.default)();
// Connect to database
(0, database_1.connectDB)();
// Initialize Firebase Admin SDK
(0, firebase_1.initializeFirebase)();
// Initialize Cloudinary
(0, cloudinary_1.initializeCloudinary)();
// Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware (development only)
if (config_1.config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.nodeEnv,
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/attendance', attendanceRoutes_1.default);
app.use('/api/locations', locationRoutes_1.default);
app.use('/api/shifts', shiftRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/emergency', emergencyRoutes_1.default);
app.use('/api/audit', auditRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map((e) => e.message),
        });
    }
    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            error: 'Duplicate Error',
            message: `${field} already exists`,
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid Token',
            message: 'The provided token is invalid',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token Expired',
            message: 'The provided token has expired',
        });
    }
    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(config_1.config.nodeEnv === 'development' && { stack: err.stack }),
    });
});
// Start server
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   Guard Attendance System API Server         ║
║   Environment: ${config_1.config.nodeEnv.padEnd(30)}║
║   Port: ${PORT.toString().padEnd(37)}║
╚═══════════════════════════════════════════════╝
  `);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
exports.default = app;
