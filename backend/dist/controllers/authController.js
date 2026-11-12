import { z } from 'zod';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
const registerSchema = z.object({
    name: z.string().min(2, 'Name is required').max(60),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user']).optional(),
    profilePicture: z.string().url().optional().or(z.literal('')),
    provider: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const registerUser = async (req, res, next) => {
    try {
        const parsed = registerSchema.parse(req.body);
        const existingUser = await User.findOne({ email: parsed.email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({
            name: parsed.name,
            email: parsed.email.toLowerCase(),
            password: parsed.password,
            role: parsed.role || 'user',
            profilePicture: parsed.profilePicture || '',
            provider: parsed.provider || 'local',
        });
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            provider: user.provider,
            createdAt: user.createdAt,
            token: generateToken(String(user._id)),
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return next(error);
    }
};
export const loginUser = async (req, res, next) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const user = await User.findOne({ email: parsed.email.toLowerCase() });
        if (!user || !(await user.matchPassword(parsed.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            provider: user.provider,
            createdAt: user.createdAt,
            token: generateToken(String(user._id)),
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return next(error);
    }
};
