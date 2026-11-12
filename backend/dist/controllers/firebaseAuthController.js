import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? '@hbplus.fit';
export const loginWithFirebase = async (req, res) => {
    const decoded = req.firebaseUser;
    if (!decoded) {
        return res.status(401).json({ message: 'Firebase token verification failed' });
    }
    const email = decoded.email?.toLowerCase();
    if (!email) {
        return res.status(400).json({ message: 'Firebase account email is missing' });
    }
    if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
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
        }
        else {
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
    }
    catch (error) {
        console.error('Firebase login failed:', error);
        return res.status(500).json({ message: 'Unable to complete Firebase sign-in' });
    }
};
