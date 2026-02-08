import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyAlert extends Document {
  userId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyAlertSchema = new Schema<IEmergencyAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'DutyLocation',
    },
    gpsCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'acknowledged'],
      default: 'active',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
emergencyAlertSchema.index({ userId: 1, timestamp: -1 });
emergencyAlertSchema.index({ status: 1, timestamp: -1 });

export const EmergencyAlert = mongoose.model<IEmergencyAlert>(
  'EmergencyAlert',
  emergencyAlertSchema
);
