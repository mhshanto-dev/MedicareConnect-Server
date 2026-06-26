import express from 'express';
import { registerUser, loginUser, getMe, syncGoogleUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Sync Google-authenticated user to our User model and get a JWT
router.post('/sync-google', syncGoogleUser);

// Protected route — returns the current user's profile
router.get('/me', protect, getMe);

export default router;
