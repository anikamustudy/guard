import { Response } from 'express';
import { Attendance } from '../models/Attendance';
import { DutyLocation } from '../models/DutyLocation';
import { Shift } from '../models/Shift';
import { AuditLog } from '../models/AuditLog';
import { isWithinGeofence } from '../utils/geolocation';
import { AuthRequest } from '../middleware/auth';
import { cloudinary } from '../config/cloudinary';
import { sendPushNotification } from '../config/firebase';
import { User } from '../models/User';

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { locationId, shiftId, latitude, longitude, selfieBase64 } = req.body;
    const userId = req.user._id;

    // Validate shift assignment
    const shift = await Shift.findById(shiftId).populate('location');
    if (!shift) {
      res.status(404).json({ error: 'Shift not found' });
      return;
    }

    // Check if user is assigned to this shift
    const isAssigned = shift.assignedGuards.some(
      (guardId) => guardId.toString() === userId.toString()
    );
    if (!isAssigned && req.user.role === 'guard') {
      res.status(403).json({ error: 'You are not assigned to this shift' });
      return;
    }

    // Get location
    const location = await DutyLocation.findById(locationId);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // Check geofencing
    const { isWithinRadius, distance } = isWithinGeofence(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
      location.radius
    );

    if (!isWithinRadius) {
      await AuditLog.create({
        userId,
        action: 'CHECK_IN_FAILED',
        metadata: {
          reason: 'Outside geofence',
          distance,
          allowedRadius: location.radius,
          locationId,
        },
      });

      res.status(400).json({
        error: 'You are outside the allowed location radius',
        distance: Math.round(distance),
        allowedRadius: location.radius,
      });
      return;
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      userId,
      shiftId,
      createdAt: { $gte: today },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      res.status(400).json({ error: 'Already checked in for this shift today' });
      return;
    }

    // Upload selfie to Cloudinary
    let selfieUrl = '';
    if (selfieBase64) {
      try {
        const uploadResult = await cloudinary.uploader.upload(selfieBase64, {
          folder: 'guard-attendance',
          resource_type: 'image',
        });
        selfieUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Selfie upload error:', uploadError);
        res.status(400).json({ error: 'Failed to upload selfie' });
        return;
      }
    }

    // Determine if late
    const now = new Date();
    const [shiftHour, shiftMinute] = shift.startTime.split(':').map(Number);
    const shiftStart = new Date();
    shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

    const isLate = now > new Date(shiftStart.getTime() + shift.lateThreshold * 60000);
    const status = isLate ? 'late' : 'present';

    // Create or update attendance
    const attendance = existingAttendance
      ? await Attendance.findByIdAndUpdate(
          existingAttendance._id,
          {
            checkInTime: now,
            status,
            selfieUrl,
            'gpsCoordinates.checkIn': { latitude, longitude },
            'distanceFromLocation.checkIn': distance,
          },
          { new: true }
        )
      : await Attendance.create({
          userId,
          locationId,
          shiftId,
          checkInTime: now,
          status,
          selfieUrl,
          gpsCoordinates: {
            checkIn: { latitude, longitude },
          },
          distanceFromLocation: {
            checkIn: distance,
          },
        });

    if (!attendance) {
      res.status(500).json({ error: 'Failed to create attendance record' });
      return;
    }

    await AuditLog.create({
      userId,
      action: 'CHECK_IN_SUCCESS',
      metadata: {
        attendanceId: attendance._id,
        locationId,
        shiftId,
        status,
        distance,
      },
    });

    // Send notification if late
    if (isLate && req.user.fcmToken) {
      try {
        await sendPushNotification(
          req.user.fcmToken,
          'Late Check-in',
          `You checked in ${Math.floor((now.getTime() - shiftStart.getTime()) / 60000)} minutes late.`
        );
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    res.status(201).json({
      message: 'Check-in successful',
      attendance,
      status,
      distance: Math.round(distance),
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Server error during check-in' });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attendanceId, latitude, longitude } = req.body;
    const userId = req.user._id;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      userId,
    }).populate('locationId shiftId');

    if (!attendance) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }

    if (attendance.checkOutTime) {
      res.status(400).json({ error: 'Already checked out' });
      return;
    }

    if (!attendance.checkInTime) {
      res.status(400).json({ error: 'Cannot check out without checking in first' });
      return;
    }

    // Verify location for checkout
    const location = await DutyLocation.findById(attendance.locationId);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    const { isWithinRadius, distance } = isWithinGeofence(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
      location.radius
    );

    const now = new Date();
    const shift = attendance.shiftId as any;
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    const shiftEnd = new Date();
    shiftEnd.setHours(endHour, endMinute, 0, 0);

    // Check for early checkout
    const isEarlyCheckout = now < shiftEnd;
    const newStatus = isEarlyCheckout ? 'early-checkout' : attendance.status;

    attendance.checkOutTime = now;
    attendance.status = newStatus;
    attendance.gpsCoordinates.checkOut = { latitude, longitude };
    attendance.distanceFromLocation.checkOut = distance;
    await attendance.save();

    await AuditLog.create({
      userId,
      action: 'CHECK_OUT_SUCCESS',
      metadata: {
        attendanceId: attendance._id,
        status: newStatus,
        distance,
        isWithinGeofence: isWithinRadius,
      },
    });

    res.json({
      message: 'Check-out successful',
      attendance,
      status: newStatus,
      distance: Math.round(distance),
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Server error during check-out' });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const query: any = { userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('locationId', 'name address')
        .populate('shiftId', 'name startTime endTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Attendance.countDocuments(query),
    ]);

    res.json({
      attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTodayAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      createdAt: { $gte: today },
    })
      .populate('locationId', 'name address latitude longitude')
      .populate('shiftId', 'name startTime endTime');

    res.json({ attendance });
  } catch (error: any) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, locationId, status, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    if (locationId) query.locationId = locationId;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('userId', 'name email phone')
        .populate('locationId', 'name address')
        .populate('shiftId', 'name startTime endTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Attendance.countDocuments(query),
    ]);

    res.json({
      attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, userId } = req.query;

    const query: any = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    if (userId) query.userId = userId;

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats: any = {
      present: 0,
      late: 0,
      absent: 0,
      'early-checkout': 0,
      'checked-in': 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({ stats: formattedStats });
  } catch (error: any) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
