import express from 'express';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-intent', express.json(), createPaymentIntent);

// Webhook requires raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
