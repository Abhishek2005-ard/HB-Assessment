import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            provider: user.provider,
            createdAt: user.createdAt,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
