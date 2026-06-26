import express from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const router = express.Router();

// JWT-based auth is now at /api/users/* to avoid clashing with
// Better Auth's handler mounted at /api/auth/* in app.js.
router.use('/users', authRoutes);

router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);

export default router;
