import Payment from '../models/Payment.js';

export const processPayment = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Payment processed' });
  } catch (error) { next(error); }
};
