import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { loginWithFirebase } from '../controllers/firebaseAuthController.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuthMiddleware.js';
const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase', verifyFirebaseToken, loginWithFirebase);
export default router;
