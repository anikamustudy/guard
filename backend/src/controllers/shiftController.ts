import { Response } from 'express';
import { Shift } from '../models/Shift';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const createShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, startTime, endTime, lateThreshold, location, assignedGuards, daysOfWeek } = req.body;

    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      lateThreshold: lateThreshold || 15,
      location,
      assignedGuards: assignedGuards || [],
      daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'SHIFT_CREATED',
      metadata: {
        shiftId: shift._id,
        name: shift.name,
        location,
      },
    });

    res.status(201).json({
      message: 'Shift created successfully',
      shift,
    });
  } catch (error: any) {
    console.error('Create shift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllShifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, locationId, isActive } = req.query;

    const query: any = {};
    if (locationId) query.location = locationId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [shifts, total] = await Promise.all([
      Shift.find(query)
        .populate('location', 'name address')
        .populate('assignedGuards', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Shift.countDocuments(query),
    ]);

    res.json({
      shifts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getShiftById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shift = await Shift.findById(id)
      .populate('location', 'name address latitude longitude radius')
      .populate('assignedGuards', 'name email phone');

    if (!shift) {
      res.status(404).json({ error: 'Shift not found' });
      return;
    }

    res.json({ shift });
  } catch (error: any) {
    console.error('Get shift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, lateThreshold, location, assignedGuards, daysOfWeek, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (lateThreshold !== undefined) updateData.lateThreshold = lateThreshold;
    if (location !== undefined) updateData.location = location;
    if (assignedGuards !== undefined) updateData.assignedGuards = assignedGuards;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
    if (isActive !== undefined) updateData.isActive = isActive;

    const shift = await Shift.findByIdAndUpdate(id, updateData, { new: true })
      .populate('location', 'name address')
      .populate('assignedGuards', 'name email phone');

    if (!shift) {
      res.status(404).json({ error: 'Shift not found' });
      return;
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'SHIFT_UPDATED',
      metadata: {
        shiftId: shift._id,
        changes: updateData,
      },
    });

    res.json({
      message: 'Shift updated successfully',
      shift,
    });
  } catch (error: any) {
    console.error('Update shift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      res.status(404).json({ error: 'Shift not found' });
      return;
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'SHIFT_DELETED',
      metadata: {
        shiftId: shift._id,
        name: shift.name,
      },
    });

    res.json({
      message: 'Shift deleted successfully',
      shift,
    });
  } catch (error: any) {
    console.error('Delete shift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getShiftsByGuard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guardId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify guard exists
    const guard = await User.findById(guardId);
    if (!guard || guard.role !== 'guard') {
      res.status(404).json({ error: 'Guard not found' });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [shifts, total] = await Promise.all([
      Shift.find({
        assignedGuards: guardId,
        isActive: true,
      })
        .populate('location', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Shift.countDocuments({
        assignedGuards: guardId,
        isActive: true,
      }),
    ]);

    res.json({
      shifts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get shifts by guard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
