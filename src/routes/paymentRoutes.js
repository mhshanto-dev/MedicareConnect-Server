import express from 'express';
import { createPaymentIntent, handleStripeWebhook, getMyPayments } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyPayments);

router.post('/create-intent', protect, express.json(), createPaymentIntent);

// Webhook requires raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
