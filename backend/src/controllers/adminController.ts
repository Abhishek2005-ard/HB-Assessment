import type { NextFunction, Request, Response } from 'express';
import User from '../models/User.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = (req.query.search as string) || '';
    const role = req.query.role as string | undefined;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role === 'admin' || role === 'user') {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email.toLowerCase();
    if (req.body.role === 'admin' || req.body.role === 'user') user.role = req.body.role;
    if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;

    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      provider: user.provider,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [totalUsers, adminCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const providerStats = await User.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } },
    ]);

    return res.json({
      totalUsers,
      adminCount,
      userCount: totalUsers - adminCount,
      providerStats: providerStats.reduce(
        (acc, cur) => ({ ...acc, [cur._id || 'local']: cur.count }),
        {} as Record<string, number>,
      ),
      recentUsers,
    });
  } catch (error) {
    return next(error);
  }
};

