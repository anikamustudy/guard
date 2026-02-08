import mongoose, { Document, Schema } from 'mongoose';

export interface IShift extends Document {
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  lateThreshold: number; // minutes
  location: mongoose.Types.ObjectId;
  assignedGuards: mongoose.Types.ObjectId[];
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    lateThreshold: {
      type: Number,
      required: true,
      default: 15, // 15 minutes
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'DutyLocation',
      required: true,
    },
    assignedGuards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
