import express from 'express';
import { 
  getAppointments, 
  createAppointment,
  getAppointmentById,
  updateAppointment,
  getDoctorAppointments,
  getAllAppointmentsAdmin
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.route('/doctor/mine').get(protect, getDoctorAppointments);
router.route('/admin/all').get(protect, getAllAppointmentsAdmin);
router.route('/:id').get(protect, getAppointmentById).patch(protect, updateAppointment);

export default router;
