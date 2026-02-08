import { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query: any = {};
    
    if (action) query.action = action;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAuditLogsByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { action, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query: any = { userId };
    
    if (action) query.action = action;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get audit logs by user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
