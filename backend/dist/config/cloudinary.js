"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.initializeCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const config_1 = require("./config");
const initializeCloudinary = () => {
    if (config_1.config.cloudinary.cloudName && config_1.config.cloudinary.apiKey && config_1.config.cloudinary.apiSecret) {
        cloudinary_1.v2.config({
            cloud_name: config_1.config.cloudinary.cloudName,
            api_key: config_1.config.cloudinary.apiKey,
            api_secret: config_1.config.cloudinary.apiSecret,
        });
        console.log('Cloudinary configured');
    }
    else {
        console.warn('Cloudinary credentials not configured. Image uploads will not work.');
    }
};
exports.initializeCloudinary = initializeCloudinary;
