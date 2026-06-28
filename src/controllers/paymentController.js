import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, appointmentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to cents
      currency: 'usd',
      metadata: { appointmentId, userId: req.user._id.toString() },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) { next(error); }
};

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { appointmentId, userId } = paymentIntent.metadata;

    await Payment.create({
      patientId: userId,
      appointmentId,
      amount: paymentIntent.amount / 100,
      stripePaymentIntentId: paymentIntent.id,
      status: 'succeeded'
    });

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'confirmed', paymentStatus: 'paid' });
  }

  res.status(200).json({ received: true });
};

export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ patientId: req.user._id })
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' }
        }
      })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) { next(error); }
};
