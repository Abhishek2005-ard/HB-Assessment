import crypto from 'crypto';
import type { Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import type { FirebaseRequest } from '../middleware/firebaseAuthMiddleware.js';

export const loginWithFirebase = async (
  req: FirebaseRequest,
  res: Response,
) => {
  const decoded = req.firebaseUser;

  if (!decoded) {
    return res.status(401).json({ message: 'Firebase token verification failed' });
  }

  const email = decoded.email?.toLowerCase().trim();

  if (!email) {
    return res.status(400).json({ message: 'Firebase account email is missing' });
  }

  const rawDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  const allowedDomain = rawDomain !== undefined ? rawDomain.trim().toLowerCase() : '@hbplus.fit';

  const isAllowed =
    !allowedDomain ||
    allowedDomain === '*' ||
    allowedDomain === 'all' ||
    email.endsWith(allowedDomain.startsWith('@') ? allowedDomain : `@${allowedDomain}`);

  if (!isAllowed) {
    return res.status(403).json({
      message: 'Access restricted. Please login using your official domain email.',
    });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: decoded.name || 'Firebase User',
        email,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'user',
        profilePicture: decoded.picture || '',
        provider: 'google',
      });
    } else {
      user.provider = user.provider || 'google';
      user.profilePicture = user.profilePicture || decoded.picture || '';
      await user.save();
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      provider: user.provider,
      createdAt: user.createdAt,
      token: generateToken(String(user._id)),
    });
  } catch (error) {
    console.error('Firebase login failed:', error);
    return res.status(500).json({ message: 'Unable to complete Firebase sign-in' });
  }
};
