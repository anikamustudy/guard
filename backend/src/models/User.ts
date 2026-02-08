import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: 'guard' | 'supervisor' | 'admin';
  password: string;
  assignedLocations: mongoose.Types.ObjectId[];
  isActive: boolean;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['guard', 'supervisor', 'admin'],
      required: true,
      default: 'guard',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    assignedLocations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DutyLocation',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    fcmToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
