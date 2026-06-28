import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  getDoctorStats
} from '../controllers/doctorController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDoctors);
router.route('/profile/me').get(protect, getMyDoctorProfile).put(protect, updateMyDoctorProfile);
router.route('/analytics/stats').get(protect, getDoctorStats);
router.route('/:id').get(getDoctorById);

export default router;
