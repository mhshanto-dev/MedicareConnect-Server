import express from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import adminRoutes from './adminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

// JWT-based auth is now at /api/users/* to avoid clashing with
// Better Auth's handler mounted at /api/auth/* in app.js.
router.use('/users', authRoutes);

router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/reviews', reviewRoutes);

export default router;
