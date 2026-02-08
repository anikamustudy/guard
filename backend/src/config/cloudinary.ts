import { v2 as cloudinary } from 'cloudinary';
import { config } from './config';

export const initializeCloudinary = (): void => {
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    console.log('Cloudinary configured');
  } else {
    console.warn('Cloudinary credentials not configured. Image uploads will not work.');
  }
};

export { cloudinary };
