import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role || 'user',
    profilePicture: req.user.profilePicture || '',
    provider: req.user.provider || 'local',
    createdAt: req.user.createdAt,
  });
};
