import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'late' | 'absent' | 'early-checkout' | 'checked-in';
  selfieUrl?: string;
  gpsCoordinates: {
    checkIn?: {
      latitude: number;
      longitude: number;
    };
    checkOut?: {
      latitude: number;
      longitude: number;
    };
  };
  distanceFromLocation: {
    checkIn?: number;
    checkOut?: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'DutyLocation',
      required: true,
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'early-checkout', 'checked-in'],
      required: true,
      default: 'absent',
    },
    selfieUrl: {
      type: String,
    },
    gpsCoordinates: {
      checkIn: {
        latitude: Number,
        longitude: Number,
      },
      checkOut: {
        latitude: Number,
        longitude: Number,
      },
    },
    distanceFromLocation: {
      checkIn: Number,
      checkOut: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
attendanceSchema.index({ userId: 1, createdAt: -1 });
attendanceSchema.index({ locationId: 1, createdAt: -1 });
attendanceSchema.index({ shiftId: 1, createdAt: -1 });

export const Attendance = mongoose.model<IAttendance>(
  'Attendance',
  attendanceSchema
);
