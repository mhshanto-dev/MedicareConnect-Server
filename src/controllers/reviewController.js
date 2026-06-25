import Review from '../models/Review.js';

export const createReview = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Review created' });
  } catch (error) { next(error); }
};
