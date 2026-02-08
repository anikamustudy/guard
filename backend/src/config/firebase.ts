import admin from 'firebase-admin';
import { config } from './config';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) {
    return;
  }

  try {
    if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail,
        }),
      });
      console.log('Firebase Admin SDK initialized');
      firebaseInitialized = true;
    } else {
      console.warn('Firebase credentials not configured. Push notifications will not work.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  if (!firebaseInitialized) {
    console.warn('Firebase not initialized. Cannot send push notification.');
    return;
  }

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export const sendMulticastNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  if (!firebaseInitialized) {
    console.warn('Firebase not initialized. Cannot send push notification.');
    return;
  }

  try {
    await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: data || {},
    });
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};
