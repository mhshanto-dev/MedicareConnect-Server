import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/reviews can be public if doctorId query parameter is provided
router.route('/')
  .get((req, res, next) => {
    if (req.query.doctorId) {
      return next();
    }
    return protect(req, res, next);
  }, getReviews)
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;
