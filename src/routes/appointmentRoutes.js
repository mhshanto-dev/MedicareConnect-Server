import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.route('/').get(protect, getAppointments).post(protect, createAppointment);
export default router;
