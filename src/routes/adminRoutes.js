import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllDoctors,
  verifyDoctor,
  rejectDoctor,
  getAllAppointmentsAdmin,
  getAdminPayments
} from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect and admin middleware to all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById);

router.patch('/users/:id/status', updateUserStatus);

router.route('/doctors')
  .get(getAllDoctors);

router.patch('/doctors/:id/verify', verifyDoctor);
router.patch('/doctors/:id/reject', rejectDoctor);

router.get('/appointments', getAllAppointmentsAdmin);
router.get('/payments', getAdminPayments);

export default router;
