import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  syncGoogleUser,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Sync Google-authenticated user to our User model and get a JWT
router.post('/sync-google', syncGoogleUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Favorites routes
router.route('/favorites')
  .get(protect, getFavorites)
  .post(protect, addFavorite);
router.route('/favorites/:doctorId')
  .delete(protect, removeFavorite);

export default router;
