"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMulticastNotification = exports.sendPushNotification = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = require("./config");
let firebaseInitialized = false;
const initializeFirebase = () => {
    if (firebaseInitialized) {
        return;
    }
    try {
        if (config_1.config.firebase.projectId && config_1.config.firebase.privateKey && config_1.config.firebase.clientEmail) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId: config_1.config.firebase.projectId,
                    privateKey: config_1.config.firebase.privateKey,
                    clientEmail: config_1.config.firebase.clientEmail,
                }),
            });
            console.log('Firebase Admin SDK initialized');
            firebaseInitialized = true;
        }
        else {
            console.warn('Firebase credentials not configured. Push notifications will not work.');
        }
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
    }
};
exports.initializeFirebase = initializeFirebase;
const sendPushNotification = async (fcmToken, title, body, data) => {
    if (!firebaseInitialized) {
        console.warn('Firebase not initialized. Cannot send push notification.');
        return;
    }
    try {
        await firebase_admin_1.default.messaging().send({
            token: fcmToken,
            notification: {
                title,
                body,
            },
            data: data || {},
        });
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};
exports.sendPushNotification = sendPushNotification;
const sendMulticastNotification = async (fcmTokens, title, body, data) => {
    if (!firebaseInitialized) {
        console.warn('Firebase not initialized. Cannot send push notification.');
        return;
    }
    try {
        await firebase_admin_1.default.messaging().sendEachForMulticast({
            tokens: fcmTokens,
            notification: {
                title,
                body,
            },
            data: data || {},
        });
    }
    catch (error) {
        console.error('Error sending multicast notification:', error);
        throw error;
    }
};
exports.sendMulticastNotification = sendMulticastNotification;
