import { Response } from 'express';
import { EmergencyAlert } from '../models/EmergencyAlert';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { sendPushNotification } from '../config/firebase';

export const createEmergencyAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { locationId, latitude, longitude } = req.body;
    const userId = req.user._id;

    const alert = await EmergencyAlert.create({
      userId,
      locationId,
      gpsCoordinates: {
        latitude,
        longitude,
      },
      timestamp: new Date(),
      status: 'active',
    });

    await AuditLog.create({
      userId,
      action: 'EMERGENCY_ALERT_CREATED',
      metadata: {
        alertId: alert._id,
        locationId,
        coordinates: { latitude, longitude },
      },
    });

    // Notify all supervisors and admins
    const supervisorsAndAdmins = await User.find({
      role: { $in: ['supervisor', 'admin'] },
      isActive: true,
      fcmToken: { $exists: true, $ne: null },
    });

    const notificationPromises = supervisorsAndAdmins.map((user) => {
      if (user.fcmToken) {
        return sendPushNotification(
          user.fcmToken,
          '🚨 Emergency Alert',
          `${req.user.name} triggered an emergency alert!`
        ).catch((error) => {
          console.error(`Failed to send notification to ${user.email}:`, error);
        });
      }
    });

    await Promise.allSettled(notificationPromises);

    const populatedAlert = await EmergencyAlert.findById(alert._id)
      .populate('userId', 'name email phone')
      .populate('locationId', 'name address');

    res.status(201).json({
      message: 'Emergency alert created successfully',
      alert: populatedAlert,
    });
  } catch (error: any) {
    console.error('Create emergency alert error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllEmergencyAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [alerts, total] = await Promise.all([
      EmergencyAlert.find(query)
        .populate('userId', 'name email phone')
        .populate('locationId', 'name address')
        .populate('resolvedBy', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      EmergencyAlert.countDocuments(query),
    ]);

    res.json({
      alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all emergency alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEmergencyAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'acknowledged') {
        updateData.resolvedBy = req.user._id;
        updateData.resolvedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const alert = await EmergencyAlert.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email phone')
      .populate('locationId', 'name address')
      .populate('resolvedBy', 'name email');

    if (!alert) {
      res.status(404).json({ error: 'Emergency alert not found' });
      return;
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'EMERGENCY_ALERT_UPDATED',
      metadata: {
        alertId: alert._id,
        changes: updateData,
        updatedBy: req.user.email,
      },
    });

    // Notify the guard who triggered the alert
    const guard = await User.findById(alert.userId);
    if (guard && guard.fcmToken) {
      try {
        const statusMessage = status === 'acknowledged' 
          ? 'Your emergency alert has been acknowledged' 
          : 'Your emergency alert has been resolved';
        
        await sendPushNotification(
          guard.fcmToken,
          'Emergency Alert Update',
          statusMessage
        );
      } catch (error) {
        console.error('Failed to send notification to guard:', error);
      }
    }

    res.json({
      message: 'Emergency alert updated successfully',
      alert,
    });
  } catch (error: any) {
    console.error('Update emergency alert error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActiveEmergencyAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [alerts, total] = await Promise.all([
      EmergencyAlert.find({ status: 'active' })
        .populate('userId', 'name email phone')
        .populate('locationId', 'name address latitude longitude')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      EmergencyAlert.countDocuments({ status: 'active' }),
    ]);

    res.json({
      alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get active emergency alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
