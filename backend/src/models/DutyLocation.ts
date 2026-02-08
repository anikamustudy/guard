import mongoose, { Document, Schema } from 'mongoose';

export interface IDutyLocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dutyLocationSchema = new Schema<IDutyLocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
      default: 100, // 100 meters default
    },
    address: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
dutyLocationSchema.index({ latitude: 1, longitude: 1 });

export const DutyLocation = mongoose.model<IDutyLocation>(
  'DutyLocation',
  dutyLocationSchema
);
