import express from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);

export default router;
