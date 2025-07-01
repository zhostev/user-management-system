import express from 'express';
import { registerUser, loginUser, getUsers, updateUserStatus, deleteUser, getCurrentUser, registerAdmin } from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// 公开路由
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-admin', registerAdmin);

// 需要认证的路由
router.get('/users/me', authMiddleware, getCurrentUser);

// 管理员路由
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.patch('/users/:id/status', authMiddleware, adminMiddleware, updateUserStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;