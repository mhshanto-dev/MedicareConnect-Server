import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';

// GET /api/reviews
// Patient: see their own reviews. Doctor: see reviews for their profile.
// Public query: ?doctorId=xxx returns reviews for a specific doctor.
export const getReviews = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.doctorId) {
      // Public route usage — filter by doctorId
      query.doctorId = req.query.doctorId;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query.doctorId = doctor._id;
    } else if (req.user.role === 'admin') {
      query = {};
    }

    const reviews = await Review.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) { next(error); }
};

// POST /api/reviews — Patient only
export const createReview = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !appointmentId || !rating || !comment) {
      res.status(400);
      throw new Error('doctorId, appointmentId, rating, and comment are required');
    }

    // Check for duplicate review on same appointment
    const existingReview = await Review.findOne({
      patientId: req.user._id,
      appointmentId,
    });

    if (existingReview) {
      res.status(400);
      throw new Error('You have already submitted a review for this appointment');
    }

    const review = await Review.create({
      patientId: req.user._id,
      doctorId,
      appointmentId,
      rating,
      comment,
    });

    const populated = await Review.findById(review._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status');

    res.status(201).json(populated);
  } catch (error) { next(error); }
};

// PUT /api/reviews/:id — Patient can only update their own review
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.patientId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this review');
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    const updatedReview = await review.save();

    const populated = await Review.findById(updatedReview._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status');

    res.json(populated);
  } catch (error) { next(error); }
};

// DELETE /api/reviews/:id — Patient can only delete their own review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.patientId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) { next(error); }
};
