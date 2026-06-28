import express from 'express';
import {
  getPrescriptions,
  createPrescription,
  getPrescriptionById
} from '../controllers/prescriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/:id')
  .get(getPrescriptionById);

export default router;
