import { Router } from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { deleteUser, getAllUsers, getDashboardStats, getUserById, updateUser, } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
const router = Router();
// Authenticated user routes
router.get('/me', protect, getCurrentUser);
// Admin-only routes
router.get('/stats', protect, requireAdmin, getDashboardStats);
router.get('/', protect, requireAdmin, getAllUsers);
router.get('/:id', protect, requireAdmin, getUserById);
router.put('/:id', protect, requireAdmin, updateUser);
router.delete('/:id', protect, requireAdmin, deleteUser);
export default router;
