import { Response } from 'express';
import { User } from '../models/User';
import { DutyLocation } from '../models/DutyLocation';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('assignedLocations', 'name address')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('assignedLocations', 'name address latitude longitude')
      .select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, assignedLocations } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'guard',
      assignedLocations: assignedLocations || [],
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_CREATED',
      metadata: {
        createdUserId: user._id,
        role: user.role,
        createdBy: req.user.email,
      },
    });

    const userResponse = await User.findById(user._id)
      .populate('assignedLocations', 'name address')
      .select('-password');

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (password !== undefined) user.password = password; // Will be hashed by pre-save hook

    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_UPDATED',
      metadata: {
        updatedUserId: user._id,
        changes: { name, email, phone, role, passwordChanged: !!password },
        updatedBy: req.user.email,
      },
    });

    const updatedUser = await User.findById(id)
      .populate('assignedLocations', 'name address')
      .select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_DELETED',
      metadata: {
        deletedUserId: user._id,
        deletedUserEmail: user.email,
        deletedBy: req.user.email,
      },
    });

    res.json({
      message: 'User deactivated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const assignLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, locationId } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify location exists
    const location = await DutyLocation.findById(locationId);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // Check if already assigned
    const isAlreadyAssigned = user.assignedLocations.some(
      (loc) => loc.toString() === locationId
    );

    if (isAlreadyAssigned) {
      res.status(400).json({ error: 'User is already assigned to this location' });
      return;
    }

    user.assignedLocations.push(locationId);
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'LOCATION_ASSIGNED',
      metadata: {
        assignedUserId: userId,
        locationId,
        assignedBy: req.user.email,
      },
    });

    const updatedUser = await User.findById(userId)
      .populate('assignedLocations', 'name address')
      .select('-password');

    res.json({
      message: 'Location assigned successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Assign location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getGuardsByLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify location exists
    const location = await DutyLocation.findById(locationId);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [guards, total] = await Promise.all([
      User.find({
        assignedLocations: locationId,
        role: 'guard',
        isActive: true,
      })
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({
        assignedLocations: locationId,
        role: 'guard',
        isActive: true,
      }),
    ]);

    res.json({
      guards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get guards by location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
