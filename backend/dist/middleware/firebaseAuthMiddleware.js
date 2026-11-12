import admin from '../config/firebase.js';
export const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;
    const token = tokenFromHeader || req.body?.token;
    if (!token) {
        return res.status(401).json({ message: 'Firebase token is required' });
    }
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.firebaseUser = decoded;
        next();
    }
    catch (error) {
        console.error('Failed to verify Firebase ID token:', error);
        return res.status(401).json({ message: 'Invalid or expired Firebase token' });
    }
};
